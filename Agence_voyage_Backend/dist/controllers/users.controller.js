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
exports.searchUsers = exports.deleteUser = exports.getOne = exports.getAll = void 0;
const usersService = __importStar(require("../services/users.service"));
const getAll = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const data = await usersService.findAll(page, limit);
    res.json(data);
};
exports.getAll = getAll;
const getOne = async (req, res) => {
    const id = parseInt(req.params['id']);
    const user = await usersService.findById(id);
    if (!user)
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
};
exports.getOne = getOne;
const deleteUser = async (req, res) => {
    const id = parseInt(req.params['id']);
    await usersService.softDelete(id);
    res.json({ message: 'Compte supprimé avec succès' });
};
exports.deleteUser = deleteUser;
const searchUsers = async (req, res) => {
    const q = req.query.q;
    const data = await usersService.search(q || '');
    res.json(data);
};
exports.searchUsers = searchUsers;
