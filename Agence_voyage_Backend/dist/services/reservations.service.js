"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminReservations = exports.cancelReservation = exports.getReservationById = exports.getMyReservations = exports.createReservation = exports.ServiceError = void 0;
const db_1 = __importDefault(require("../config/db"));
class ServiceError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ServiceError';
    }
}
exports.ServiceError = ServiceError;
const RESERVATION_STATUSES = ['en_attente', 'confirmee', 'annulee'];
const isPositiveInteger = (value) => {
    return Number.isInteger(value) && Number(value) > 0;
};
const getReservationWithOffer = async (runner, reservationId) => {
    const [[row]] = await runner.query(`SELECT
			r.id,
			r.user_id,
			r.offre_id,
			r.nb_personnes,
			r.prix_total,
			r.statut,
			r.date_reservation,
			o.titre AS offre_titre,
			o.prix AS offre_prix,
			o.date_depart,
			o.date_retour,
			o.places_disponibles,
			(
				SELECT p.statut
				FROM paiements p
				WHERE p.reservation_id = r.id
				ORDER BY p.date_paiement DESC, p.id DESC
				LIMIT 1
			) AS paiement_statut
		 FROM reservations r
		 INNER JOIN offres o ON o.id = r.offre_id
		 WHERE r.id = ?`, [reservationId]);
    return row || null;
};
const createReservation = async (userId, payload) => {
    const { offre_id, nb_personnes } = payload;
    if (!isPositiveInteger(offre_id)) {
        throw new ServiceError(400, 'offre_id doit etre un entier positif');
    }
    if (!isPositiveInteger(nb_personnes)) {
        throw new ServiceError(400, 'nb_personnes doit etre un entier positif');
    }
    const connection = await db_1.default.getConnection();
    try {
        await connection.beginTransaction();
        const [[offre]] = await connection.query(`SELECT id, titre, prix, date_depart, places_disponibles
			 FROM offres
			 WHERE id = ?
			 FOR UPDATE`, [offre_id]);
        if (!offre) {
            throw new ServiceError(404, 'Offre introuvable');
        }
        const availableSeats = Number(offre.places_disponibles);
        if (availableSeats < nb_personnes) {
            throw new ServiceError(409, 'Places insuffisantes pour cette offre');
        }
        const departureDate = new Date(offre.date_depart);
        const now = new Date();
        if (departureDate.getTime() < now.getTime()) {
            throw new ServiceError(409, 'Cette offre est deja expiree');
        }
        const totalPrice = Number(offre.prix) * nb_personnes;
        const [insertResult] = await connection.query(`INSERT INTO reservations (
				user_id,
				offre_id,
				nb_personnes,
				prix_total,
				statut,
				date_reservation
			) VALUES (?, ?, ?, ?, 'en_attente', NOW())`, [userId, offre_id, nb_personnes, totalPrice]);
        await connection.query(`UPDATE offres
			 SET places_disponibles = places_disponibles - ?
			 WHERE id = ?`, [nb_personnes, offre_id]);
        const reservation = await getReservationWithOffer(connection, insertResult.insertId);
        await connection.commit();
        return reservation;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.createReservation = createReservation;
const getMyReservations = async (userId, page = 1, limit = 10) => {
    const safePage = isPositiveInteger(page) ? page : 1;
    const safeLimit = isPositiveInteger(limit) ? Math.min(limit, 100) : 10;
    const offset = (safePage - 1) * safeLimit;
    const [rows] = await db_1.default.query(`SELECT
			r.id,
			r.user_id,
			r.offre_id,
			r.nb_personnes,
			r.prix_total,
			r.statut,
			r.date_reservation,
			o.titre AS offre_titre,
			o.date_depart,
			o.date_retour,
			(
				SELECT p.statut
				FROM paiements p
				WHERE p.reservation_id = r.id
				ORDER BY p.date_paiement DESC, p.id DESC
				LIMIT 1
			) AS paiement_statut
		 FROM reservations r
		 INNER JOIN offres o ON o.id = r.offre_id
		 WHERE r.user_id = ?
		 ORDER BY r.date_reservation DESC
		 LIMIT ? OFFSET ?`, [userId, safeLimit, offset]);
    const [[count]] = await db_1.default.query(`SELECT COUNT(*) AS total
		 FROM reservations
		 WHERE user_id = ?`, [userId]);
    return {
        data: rows,
        total: count.total,
        page: safePage,
        totalPages: Math.max(1, Math.ceil(count.total / safeLimit))
    };
};
exports.getMyReservations = getMyReservations;
const getReservationById = async (reservationId, userId, role) => {
    if (!isPositiveInteger(reservationId)) {
        throw new ServiceError(400, 'id reservation invalide');
    }
    const reservation = await getReservationWithOffer(db_1.default, reservationId);
    if (!reservation) {
        throw new ServiceError(404, 'Reservation introuvable');
    }
    if (role !== 'admin' && Number(reservation.user_id) !== userId) {
        throw new ServiceError(403, 'Acces refuse a cette reservation');
    }
    return reservation;
};
exports.getReservationById = getReservationById;
const cancelReservation = async (reservationId, userId, role) => {
    if (!isPositiveInteger(reservationId)) {
        throw new ServiceError(400, 'id reservation invalide');
    }
    const connection = await db_1.default.getConnection();
    try {
        await connection.beginTransaction();
        const [[reservation]] = await connection.query(`SELECT id, user_id, offre_id, nb_personnes, statut
			 FROM reservations
			 WHERE id = ?
			 FOR UPDATE`, [reservationId]);
        if (!reservation) {
            throw new ServiceError(404, 'Reservation introuvable');
        }
        if (role !== 'admin' && Number(reservation.user_id) !== userId) {
            throw new ServiceError(403, 'Vous ne pouvez pas annuler cette reservation');
        }
        if (reservation.statut === 'annulee') {
            throw new ServiceError(409, 'Cette reservation est deja annulee');
        }
        await connection.query(`UPDATE reservations
			 SET statut = 'annulee'
			 WHERE id = ?`, [reservationId]);
        await connection.query(`UPDATE offres
			 SET places_disponibles = places_disponibles + ?
			 WHERE id = ?`, [reservation.nb_personnes, reservation.offre_id]);
        const updatedReservation = await getReservationWithOffer(connection, reservationId);
        await connection.commit();
        return updatedReservation;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.cancelReservation = cancelReservation;
const getAdminReservations = async (page = 1, limit = 20, status) => {
    const safePage = isPositiveInteger(page) ? page : 1;
    const safeLimit = isPositiveInteger(limit) ? Math.min(limit, 100) : 20;
    const offset = (safePage - 1) * safeLimit;
    if (status && !RESERVATION_STATUSES.includes(status)) {
        throw new ServiceError(400, 'Filtre status invalide');
    }
    const whereClause = status ? 'WHERE r.statut = ?' : '';
    const queryParams = status ? [status, safeLimit, offset] : [safeLimit, offset];
    const countParams = status ? [status] : [];
    const [rows] = await db_1.default.query(`SELECT
			r.id,
			r.user_id,
			r.offre_id,
			r.nb_personnes,
			r.prix_total,
			r.statut,
			r.date_reservation,
			u.nom,
			u.prenom,
			u.email,
			o.titre AS offre_titre,
			o.date_depart,
			(
				SELECT p.statut
				FROM paiements p
				WHERE p.reservation_id = r.id
				ORDER BY p.date_paiement DESC, p.id DESC
				LIMIT 1
			) AS paiement_statut
		 FROM reservations r
		 INNER JOIN users u ON u.id = r.user_id
		 INNER JOIN offres o ON o.id = r.offre_id
		 ${whereClause}
		 ORDER BY r.date_reservation DESC
		 LIMIT ? OFFSET ?`, queryParams);
    const [[count]] = await db_1.default.query(`SELECT COUNT(*) AS total
		 FROM reservations r
		 ${whereClause}`, countParams);
    return {
        data: rows,
        total: count.total,
        page: safePage,
        totalPages: Math.max(1, Math.ceil(count.total / safeLimit))
    };
};
exports.getAdminReservations = getAdminReservations;
