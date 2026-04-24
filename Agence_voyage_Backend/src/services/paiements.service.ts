import db from '../config/db';
import { ServiceError } from './reservations.service';

const PAYMENT_METHODS = ['carte', 'paypal', 'virement', 'especes'] as const;
const PAYMENT_STATUSES = ['en_attente', 'reussi', 'echoue', 'rembourse'] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number];
type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

type QueryRunner = {
	query: (sql: string, values?: any[]) => Promise<any>;
};

export interface CreatePaymentInput {
	reservation_id: number;
	montant: number;
	methode: string;
}

const isPositiveInteger = (value: unknown): value is number => {
	return Number.isInteger(value) && Number(value) > 0;
};

const getPaymentById = async (runner: QueryRunner, paymentId: number) => {
	const [[payment]] = await runner.query(
		`SELECT
			id,
			reservation_id,
			montant,
			methode,
			statut,
			transaction_id,
			date_paiement
		 FROM paiements
		 WHERE id = ?`,
		[paymentId]
	) as any;

	return payment || null;
};

export const createPayment = async (
	userId: number,
	role: string,
	payload: CreatePaymentInput
) => {
	const reservationId = Number(payload.reservation_id);
	const montant = Number(payload.montant);
	const methode = String(payload.methode || '').toLowerCase();

	if (!isPositiveInteger(reservationId)) {
		throw new ServiceError(400, 'reservation_id doit etre un entier positif');
	}

	if (!Number.isFinite(montant) || montant <= 0) {
		throw new ServiceError(400, 'montant doit etre un nombre positif');
	}

	if (!PAYMENT_METHODS.includes(methode as PaymentMethod)) {
		throw new ServiceError(400, 'methode de paiement invalide');
	}

	const [[reservation]] = await db.query(
		`SELECT id, user_id, prix_total, statut
		 FROM reservations
		 WHERE id = ?`,
		[reservationId]
	) as any;

	if (!reservation) {
		throw new ServiceError(404, 'Reservation introuvable');
	}

	if (role !== 'admin' && Number(reservation.user_id) !== userId) {
		throw new ServiceError(403, 'Vous ne pouvez pas payer cette reservation');
	}

	if (reservation.statut === 'annulee') {
		throw new ServiceError(409, 'Impossible de payer une reservation annulee');
	}

	if (montant > Number(reservation.prix_total)) {
		throw new ServiceError(409, 'Le montant depasse le total de la reservation');
	}

	const transactionId = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

	const [insertResult] = await db.query(
		`INSERT INTO paiements (
			reservation_id,
			montant,
			methode,
			statut,
			transaction_id,
			date_paiement
		) VALUES (?, ?, ?, 'en_attente', ?, NOW())`,
		[reservationId, montant, methode, transactionId]
	) as any;

	return getPaymentById(db, insertResult.insertId);
};

export const getPaymentsByReservation = async (
	reservationId: number,
	userId: number,
	role: string
) => {
	if (!isPositiveInteger(reservationId)) {
		throw new ServiceError(400, 'reservationId invalide');
	}

	const [[reservation]] = await db.query(
		`SELECT id, user_id
		 FROM reservations
		 WHERE id = ?`,
		[reservationId]
	) as any;

	if (!reservation) {
		throw new ServiceError(404, 'Reservation introuvable');
	}

	if (role !== 'admin' && Number(reservation.user_id) !== userId) {
		throw new ServiceError(403, 'Acces refuse aux paiements de cette reservation');
	}

	const [rows] = await db.query(
		`SELECT
			id,
			reservation_id,
			montant,
			methode,
			statut,
			transaction_id,
			date_paiement
		 FROM paiements
		 WHERE reservation_id = ?
		 ORDER BY date_paiement DESC, id DESC`,
		[reservationId]
	);

	return rows;
};

export const updatePaymentStatus = async (paymentId: number, nextStatus: string) => {
	if (!isPositiveInteger(paymentId)) {
		throw new ServiceError(400, 'id paiement invalide');
	}

	if (!PAYMENT_STATUSES.includes(nextStatus as PaymentStatus)) {
		throw new ServiceError(400, 'Nouveau status de paiement invalide');
	}

	const allowedTransitions: Record<PaymentStatus, PaymentStatus[]> = {
		en_attente: ['reussi', 'echoue'],
		reussi: ['rembourse'],
		echoue: [],
		rembourse: []
	};

	const connection = await db.getConnection();

	try {
		await connection.beginTransaction();

		const [[payment]] = await connection.query(
			`SELECT id, reservation_id, statut
			 FROM paiements
			 WHERE id = ?
			 FOR UPDATE`,
			[paymentId]
		) as any;

		if (!payment) {
			throw new ServiceError(404, 'Paiement introuvable');
		}

		const currentStatus = payment.statut as PaymentStatus;
		const requestedStatus = nextStatus as PaymentStatus;

		if (currentStatus !== requestedStatus) {
			const isTransitionAllowed = allowedTransitions[currentStatus].includes(requestedStatus);
			if (!isTransitionAllowed) {
				throw new ServiceError(409, 'Transition de status non autorisee');
			}

			await connection.query(
				`UPDATE paiements
				 SET statut = ?
				 WHERE id = ?`,
				[requestedStatus, paymentId]
			);

			if (requestedStatus === 'reussi') {
				await connection.query(
					`UPDATE reservations
					 SET statut = 'confirmee'
					 WHERE id = ?
						 AND statut <> 'annulee'`,
					[payment.reservation_id]
				);
			}
		}

		const updatedPayment = await getPaymentById(connection, paymentId);

		await connection.commit();

		return updatedPayment;
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};
 
