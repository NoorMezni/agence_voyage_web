import { Router } from 'express';
import * as reservationsController from '../controllers/reservations.controller';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.post('/', reservationsController.createReservation);
router.get('/me', reservationsController.getMyReservations);
router.get('/admin/all', isAdmin, reservationsController.getAdminReservations);
router.get('/:id', reservationsController.getReservationById);
router.patch('/:id/cancel', reservationsController.cancelReservation);

export default router;
 
