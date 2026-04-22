// dashboard.routes.ts
import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller';
// import { verifyToken, isAdmin } from '../middleware/auth.middleware';  ← commente

const router = Router();
// router.use(verifyToken, isAdmin);  ← commente

router.get('/stats', getStats);

export default router;