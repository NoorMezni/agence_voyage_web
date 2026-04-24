"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatus = exports.getPaymentsByReservation = exports.createPayment = void 0;
const db_1 = __importDefault(require("../config/db"));
const reservations_service_1 = require("./reservations.service");
const PAYMENT_METHODS = ['carte', 'paypal', 'virement', 'especes'];
const PAYMENT_STATUSES = ['en_attente', 'reussi', 'echoue', 'rembourse'];
const isPositiveInteger = (value) => {
    return Number.isInteger(value) && Number(value) > 0;
};
const getPaymentById = async (runner, paymentId) => {
    const [[payment]] = await runner.query(`SELECT
			id,
			reservation_id,
			montant,
			methode,
			statut,
			transaction_id,
			date_paiement
		 FROM paiements
		 WHERE id = ?`, [paymentId]);
    return payment || null;
};
const createPayment = async (userId, role, payload) => {
    const reservationId = Number(payload.reservation_id);
    const montant = Number(payload.montant);
    const methode = String(payload.methode || '').toLowerCase();
    if (!isPositiveInteger(reservationId)) {
        throw new reservations_service_1.ServiceError(400, 'reservation_id doit etre un entier positif');
    }
    if (!Number.isFinite(montant) || montant <= 0) {
        throw new reservations_service_1.ServiceError(400, 'montant doit etre un nombre positif');
    }
    if (!PAYMENT_METHODS.includes(methode)) {
        throw new reservations_service_1.ServiceError(400, 'methode de paiement invalide');
    }
    const [[reservation]] = await db_1.default.query(`SELECT id, user_id, prix_total, statut
		 FROM reservations
		 WHERE id = ?`, [reservationId]);
    if (!reservation) {
        throw new reservations_service_1.ServiceError(404, 'Reservation introuvable');
    }
    if (role !== 'admin' && Number(reservation.user_id) !== userId) {
        throw new reservations_service_1.ServiceError(403, 'Vous ne pouvez pas payer cette reservation');
    }
    if (reservation.statut === 'annulee') {
        throw new reservations_service_1.ServiceError(409, 'Impossible de payer une reservation annulee');
    }
    if (montant > Number(reservation.prix_total)) {
        throw new reservations_service_1.ServiceError(409, 'Le montant depasse le total de la reservation');
    }
    const transactionId = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const [insertResult] = await db_1.default.query(`INSERT INTO paiements (
			reservation_id,
			montant,
			methode,
			statut,
			transaction_id,
			date_paiement
		) VALUES (?, ?, ?, 'en_attente', ?, NOW())`, [reservationId, montant, methode, transactionId]);
    return getPaymentById(db_1.default, insertResult.insertId);
};
exports.createPayment = createPayment;
const getPaymentsByReservation = async (reservationId, userId, role) => {
    if (!isPositiveInteger(reservationId)) {
        throw new reservations_service_1.ServiceError(400, 'reservationId invalide');
    }
    const [[reservation]] = await db_1.default.query(`SELECT id, user_id
		 FROM reservations
		 WHERE id = ?`, [reservationId]);
    if (!reservation) {
        throw new reservations_service_1.ServiceError(404, 'Reservation introuvable');
    }
    if (role !== 'admin' && Number(reservation.user_id) !== userId) {
        throw new reservations_service_1.ServiceError(403, 'Acces refuse aux paiements de cette reservation');
    }
    const [rows] = await db_1.default.query(`SELECT
			id,
			reservation_id,
			montant,
			methode,
			statut,
			transaction_id,
			date_paiement
		 FROM paiements
		 WHERE reservation_id = ?
		 ORDER BY date_paiement DESC, id DESC`, [reservationId]);
    return rows;
};
exports.getPaymentsByReservation = getPaymentsByReservation;
const updatePaymentStatus = async (paymentId, nextStatus) => {
    if (!isPositiveInteger(paymentId)) {
        throw new reservations_service_1.ServiceError(400, 'id paiement invalide');
    }
    if (!PAYMENT_STATUSES.includes(nextStatus)) {
        throw new reservations_service_1.ServiceError(400, 'Nouveau status de paiement invalide');
    }
    const allowedTransitions = {
        en_attente: ['reussi', 'echoue'],
        reussi: ['rembourse'],
        echoue: [],
        rembourse: []
    };
    const connection = await db_1.default.getConnection();
    try {
        await connection.beginTransaction();
        const [[payment]] = await connection.query(`SELECT id, reservation_id, statut
			 FROM paiements
			 WHERE id = ?
			 FOR UPDATE`, [paymentId]);
        if (!payment) {
            throw new reservations_service_1.ServiceError(404, 'Paiement introuvable');
        }
        const currentStatus = payment.statut;
        const requestedStatus = nextStatus;
        if (currentStatus !== requestedStatus) {
            const isTransitionAllowed = allowedTransitions[currentStatus].includes(requestedStatus);
            if (!isTransitionAllowed) {
                throw new reservations_service_1.ServiceError(409, 'Transition de status non autorisee');
            }
            await connection.query(`UPDATE paiements
				 SET statut = ?
				 WHERE id = ?`, [requestedStatus, paymentId]);
            if (requestedStatus === 'reussi') {
                await connection.query(`UPDATE reservations
					 SET statut = 'confirmee'
					 WHERE id = ?
						 AND statut <> 'annulee'`, [payment.reservation_id]);
            }
        }
        const updatedPayment = await getPaymentById(connection, paymentId);
        await connection.commit();
        return updatedPayment;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
