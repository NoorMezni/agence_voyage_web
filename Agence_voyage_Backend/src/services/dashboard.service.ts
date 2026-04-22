import db from '../config/db';

// ── Carte 1 : Total utilisateurs tous rôles confondus ──
export const getTotalUsers = async () => {
  const [[row]] = await db.query(
    `SELECT COUNT(*) AS total FROM users`
  ) as any;
  return row.total;
};

// ── Carte 2 : Nouvelles inscriptions ce mois-ci + comparaison mois dernier ──
export const getNewRegistrations = async () => {
  const [[thisMont]] = await db.query(
    `SELECT COUNT(*) AS total FROM users
     WHERE MONTH(created_at) = MONTH(NOW())
       AND YEAR(created_at)  = YEAR(NOW())`
  ) as any;

  const [[lastMonth]] = await db.query(
    `SELECT COUNT(*) AS total FROM users
     WHERE MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
       AND YEAR(created_at)  = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))`
  ) as any;

  const diff = thisMont.total - lastMonth.total;
  const percent = lastMonth.total > 0
    ? Math.round((diff / lastMonth.total) * 100)
    : 100;

  return {
    total:        thisMont.total,
    vsLastMonth:  diff,        // +8 ou -3
    percent:      percent,     // +22% ou -15%
    trend:        diff >= 0 ? 'up' : 'down'
  };
};

// ── Carte 3 : Comptes supprimés ce mois vs mois dernier ──
// ⚠️  Pour ça il faut ajouter un champ deleted_at à la table users
// ALTER TABLE users ADD COLUMN deleted_at DATETIME DEFAULT NULL;
// Un user supprimé → on met deleted_at = NOW() au lieu de DELETE

export const getDeletedAccounts = async () => {
  const [[thisMont]] = await db.query(
    `SELECT COUNT(*) AS total FROM users
     WHERE deleted_at IS NOT NULL
       AND MONTH(deleted_at) = MONTH(NOW())
       AND YEAR(deleted_at)  = YEAR(NOW())`
  ) as any;

  const [[lastMonth]] = await db.query(
    `SELECT COUNT(*) AS total FROM users
     WHERE deleted_at IS NOT NULL
       AND MONTH(deleted_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
       AND YEAR(deleted_at)  = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))`
  ) as any;

  return {
    total:       thisMont.total,
    vsLastMonth: thisMont.total - lastMonth.total  // –3 vs mois dernier
  };
};

// ── Graphique barres : inscriptions par mois (6 derniers mois) ──
export const getRegistrationsByMonth = async () => {
  const [rows] = await db.query(
    `SELECT 
       DATE_FORMAT(created_at, '%b') AS mois,
       MONTH(created_at)             AS mois_num,
       YEAR(created_at)              AS annee,
       COUNT(*)                      AS total
     FROM users
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       AND deleted_at IS NULL
     GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
     ORDER BY annee ASC, mois_num ASC`
  );
  return rows;
};

// ── Graphique donut : répartition par rôle ──
export const getRoleDistribution = async () => {
  const [rows] = await db.query(
    `SELECT 
       role,
       COUNT(*) AS total
     FROM users
     WHERE deleted_at IS NULL
     GROUP BY role`
  ) as any;

  const grandTotal = rows.reduce((sum: number, r: any) => sum + r.total, 0);

  return rows.map((r: any) => ({
    role:       r.role,
    total:      r.total,
    percentage: Math.round((r.total / grandTotal) * 100)
  }));
  // Retourne : [{ role: "client", total: 1510, percentage: 82 }, ...]
};