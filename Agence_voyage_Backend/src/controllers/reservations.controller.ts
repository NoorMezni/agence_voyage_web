import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as reservationsService from '../services/reservations.service';
import { ServiceError } from '../services/reservations.service';

const handleServiceError = (res: Response, error: unknown) => {
	if (error instanceof ServiceError) {
		res.status(error.statusCode).json({ message: error.message });
		return;
	}

	const message = error instanceof Error ? error.message : 'Erreur interne serveur';
	res.status(500).json({ message });
};

export const createReservation = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'Authentification requise' });
		return;
	}

	try {
		const offreId = Number.parseInt(String(req.body?.offre_id), 10);
		const nbPersonnes = Number.parseInt(String(req.body?.nb_personnes), 10);

		const reservation = await reservationsService.createReservation(req.user.id, {
			offre_id: offreId,
			nb_personnes: nbPersonnes
		});

		res.status(201).json(reservation);
	} catch (error) {
		handleServiceError(res, error);
	}
};

export const getMyReservations = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'Authentification requise' });
		return;
	}

	try {
		const page = Number.parseInt(String(req.query.page || '1'), 10);
		const limit = Number.parseInt(String(req.query.limit || '10'), 10);

		const result = await reservationsService.getMyReservations(req.user.id, page, limit);
		res.json(result);
	} catch (error) {
		handleServiceError(res, error);
	}
};

export const getReservationById = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'Authentification requise' });
		return;
	}

	try {
		const reservationId = Number.parseInt(String(req.params['id']), 10);

		const reservation = await reservationsService.getReservationById(
			reservationId,
			req.user.id,
			req.user.role
		);

		res.json(reservation);
	} catch (error) {
		handleServiceError(res, error);
	}
};

export const cancelReservation = async (req: AuthRequest, res: Response): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'Authentification requise' });
		return;
	}

	try {
		const reservationId = Number.parseInt(String(req.params['id']), 10);

		const reservation = await reservationsService.cancelReservation(
			reservationId,
			req.user.id,
			req.user.role
		);

		res.json(reservation);
	} catch (error) {
		handleServiceError(res, error);
	}
};

export const getAdminReservations = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const page = Number.parseInt(String(req.query.page || '1'), 10);
		const limit = Number.parseInt(String(req.query.limit || '20'), 10);
		const status = req.query.status ? String(req.query.status) : undefined;

		const reservations = await reservationsService.getAdminReservations(page, limit, status);
		res.json(reservations);
	} catch (error) {
		handleServiceError(res, error);
	}
};
