"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// dashboard.routes.ts
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
// import { verifyToken, isAdmin } from '../middleware/auth.middleware';  ← commente
const router = (0, express_1.Router)();
// router.use(verifyToken, isAdmin);  ← commente
router.get('/stats', dashboard_controller_1.getStats);
exports.default = router;
