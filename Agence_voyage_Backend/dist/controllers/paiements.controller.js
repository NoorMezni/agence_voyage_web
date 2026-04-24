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
exports.updatePaymentStatus = exports.getReservationPayments = exports.createPayment = void 0;
const paiementsService = __importStar(require("../services/paiements.service"));
const reservations_service_1 = require("../services/reservations.service");
const handleServiceError = (res, error) => {
    if (error instanceof reservations_service_1.ServiceError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
    }
    const message = error instanceof Error ? error.message : 'Erreur interne serveur';
    res.status(500).json({ message });
};
const createPayment = async (req, res) => {
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
    }
    catch (error) {
        handleServiceError(res, error);
    }
};
exports.createPayment = createPayment;
const getReservationPayments = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
    }
    try {
        const reservationId = Number.parseInt(String(req.params['reservationId']), 10);
        const payments = await paiementsService.getPaymentsByReservation(reservationId, req.user.id, req.user.role);
        res.json(payments);
    }
    catch (error) {
        handleServiceError(res, error);
    }
};
exports.getReservationPayments = getReservationPayments;
const updatePaymentStatus = async (req, res) => {
    try {
        const paymentId = Number.parseInt(String(req.params['id']), 10);
        const status = String(req.body?.status || '');
        const payment = await paiementsService.updatePaymentStatus(paymentId, status);
        res.json(payment);
    }
    catch (error) {
        handleServiceError(res, error);
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
