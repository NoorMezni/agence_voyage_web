"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// ── Middlewares globaux ──
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ── Test connexion MySQL ──
db_1.default.getConnection()
    .then(() => console.log('✅ MySQL connecté avec succès'))
    .catch((err) => console.error('❌ Erreur connexion MySQL :', err.message));
// ── Routes ──
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const reservations_routes_1 = __importDefault(require("./routes/reservations.routes"));
const paiements_routes_1 = __importDefault(require("./routes/paiements.routes"));
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/reservations', reservations_routes_1.default);
app.use('/api/paiements', paiements_routes_1.default);
// ── Lancement serveur ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
exports.default = app;
