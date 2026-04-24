"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminReservations = exports.cancelReservation = exports.getReservationById = exports.getMyReservations = exports.createReservation = void 0;
const reservationsService = __importStar(require("../services/reservations.service"));
const reservations_service_1 = require("../services/reservations.service");
const handleServiceError = (res, error) => {
    if (error instanceof reservations_service_1.ServiceError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
    }
    const message = error instanceof Error ? error.message : 'Erreur interne serveur';
    res.status(500).json({ message });
};
const createReservation = async (req, res) => {
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
    }
    catch (error) {
        handleServiceError(res, error);
    }
};
exports.createReservation = createReservation;
const getMyReservations = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
    }
    try {
        const page = Number.parseInt(String(req.query.page || '1'), 10);
        const limit = Number.parseInt(String(req.query.limit || '10'), 10);
        const result = await reservationsService.getMyReservations(req.user.id, page, limit);
        res.json(result);
    }
    catch (error) {
        handleServiceError(res, error);
    }
};
exports.getMyReservations = getMyReservations;
const getReservationById = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
    }
    try {
        const reservationId = Number.parseInt(String(req.params['id']), 10);
        const reservation = await reservationsService.getReservationById(reservationId, req.user.id, req.user.role);
        res.json(reservation);
    }
    catch (error) {
        handleServiceError(res, error);
    }
};
exports.getReservationById = getReservationById;
const cancelReservation = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
    }
    try {
        const reservationId = Number.parseInt(String(req.params['id']), 10);
        const reservation = await reservationsService.cancelReservation(reservationId, req.user.id, req.user.role);
        res.json(reservation);
    }
    catch (error) {
        handleServiceError(res, error);
    }
};
exports.cancelReservation = cancelReservation;
const getAdminReservations = async (req, res) => {
    try {
        const page = Number.parseInt(String(req.query.page || '1'), 10);
        const limit = Number.parseInt(String(req.query.limit || '20'), 10);
        const status = req.query.status ? String(req.query.status) : undefined;
        const reservations = await reservationsService.getAdminReservations(page, limit, status);
        res.json(reservations);
    }
    catch (error) {
        handleServiceError(res, error);
    }
};
exports.getAdminReservations = getAdminReservations;
