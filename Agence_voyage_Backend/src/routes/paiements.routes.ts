import { Router } from 'express';
import * as paiementsController from '../controllers/paiements.controller';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.post('/', paiementsController.createPayment);
router.get('/reservation/:reservationId', paiementsController.getReservationPayments);
router.patch('/:id/status', isAdmin, paiementsController.updatePaymentStatus);

export default router;
 
