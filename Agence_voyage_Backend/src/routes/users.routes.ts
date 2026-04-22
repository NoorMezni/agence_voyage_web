 // users.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/users.controller';
// import { verifyToken, isAdmin } from '../middleware/auth.middleware';  ← commente


const router = Router();
//router.use(authMiddleware, isAdmin);

router.get('/',        ctrl.getAll);      // GET  /api/users?page=1&limit=20
router.get('/search',  ctrl.searchUsers); // GET  /api/users/search?q=ahmed
router.get('/:id',     ctrl.getOne);      // GET  /api/users/42
router.delete('/:id',  ctrl.deleteUser);  // DELETE /api/users/42

export default router;
