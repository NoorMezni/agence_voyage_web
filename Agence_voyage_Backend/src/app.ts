import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db';

dotenv.config();

const app = express();

// ── Middlewares globaux ──
app.use(cors());
app.use(express.json());

// ── Test connexion MySQL ──
db.getConnection()
  .then(() => console.log('✅ MySQL connecté avec succès'))
  .catch((err) => console.error('❌ Erreur connexion MySQL :', err.message));

// ── Routes ──
import dashboardRoutes from './routes/dashboard.routes';
import usersRoutes from './routes/users.routes';
import reservationsRoutes from './routes/reservations.routes';
import paiementsRoutes from './routes/paiements.routes';

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/paiements', paiementsRoutes);


// ── Lancement serveur ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

export default app;