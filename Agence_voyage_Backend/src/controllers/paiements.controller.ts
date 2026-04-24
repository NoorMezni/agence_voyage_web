import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as paiementsService from '../services/paiements.service';
import { ServiceError } from '../services/reservations.service';

const handleServiceError = (res: Response, error: unknown) => {
	if (error instanceof ServiceError) {
		res.status(error.statusCode).json({ message: error.message });
		return;
	}

	const message = error instanceof Error ? error.message : 'Erreur interne serveur';
	res.status(500).json({ message });
};

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'Authentification requise' });
		return;
	}

	try {
		const reservationId = Number.parseInt(String(req.body?.reservation_id), 10);
		const montant = Number(req.body?.montant);
		const methode = String(req.body?.methode || '');

		const payment = await paiementsService.createPayment(req.user.id, req.user.role, {
			reservation_id: reservationId,
			montant,
			methode
		});

		res.status(201).json(payment);
	} catch (error) {
		handleServiceError(res, error);
	}
};

export const getReservationPayments = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'Authentification requise' });
		return;
	}

	try {
		const reservationId = Number.parseInt(String(req.params['reservationId']), 10);

		const payments = await paiementsService.getPaymentsByReservation(
			reservationId,
			req.user.id,
			req.user.role
		);

		res.json(payments);
	} catch (error) {
		handleServiceError(res, error);
	}
};

export const updatePaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const paymentId = Number.parseInt(String(req.params['id']), 10);
		const status = String(req.body?.status || '');

		const payment = await paiementsService.updatePaymentStatus(paymentId, status);
		res.json(payment);
	} catch (error) {
		handleServiceError(res, error);
	}
};
 
