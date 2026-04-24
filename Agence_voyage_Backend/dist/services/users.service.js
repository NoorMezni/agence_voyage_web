"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.softDelete = exports.findById = exports.findAll = void 0;
const db_1 = __importDefault(require("../config/db"));
// ── Liste tous les utilisateurs (avec pagination) ──
const findAll = async (page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    const [rows] = await db_1.default.query(`SELECT id, nom, prenom, email, role, telephone, created_at
     FROM users
     WHERE deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`, [limit, offset]);
    const [[count]] = await db_1.default.query(`SELECT COUNT(*) AS total FROM users WHERE deleted_at IS NULL`);
    return {
        data: rows,
        total: count.total,
        page,
        totalPages: Math.ceil(count.total / limit)
    };
};
exports.findAll = findAll;
// ── Voir le détail d'un utilisateur ──
const findById = async (id) => {
    const [[user]] = await db_1.default.query(`SELECT id, nom, prenom, email, role, telephone, created_at
     FROM users WHERE id = ? AND deleted_at IS NULL`, [id]);
    return user || null;
};
exports.findById = findById;
// ── Supprimer un utilisateur (soft delete) ──
const softDelete = async (id) => {
    await db_1.default.query(`UPDATE users SET deleted_at = NOW() WHERE id = ?`, [id]);
};
exports.softDelete = softDelete;
// ── Rechercher un utilisateur par nom ou email ──
const search = async (query) => {
    const [rows] = await db_1.default.query(`SELECT id, nom, prenom, email, role, created_at
     FROM users
     WHERE deleted_at IS NULL
       AND (nom   LIKE ? 
        OR  prenom LIKE ? 
        OR  email  LIKE ?)
     ORDER BY created_at DESC
     LIMIT 20`, [`%${query}%`, `%${query}%`, `%${query}%`]);
    return rows;
};
exports.search = search;
