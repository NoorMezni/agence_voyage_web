 import db from '../config/db';

// ── Liste tous les utilisateurs (avec pagination) ──
export const findAll = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const [rows] = await db.query(
    `SELECT id, nom, prenom, email, role, telephone, created_at
     FROM users
     WHERE deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const [[count]] = await db.query(
    `SELECT COUNT(*) AS total FROM users WHERE deleted_at IS NULL`
  ) as any;

  return {
    data:       rows,
    total:      count.total,
    page,
    totalPages: Math.ceil(count.total / limit)
  };
};

// ── Voir le détail d'un utilisateur ──
export const findById = async (id: number) => {
  const [[user]] = await db.query(
    `SELECT id, nom, prenom, email, role, telephone, created_at
     FROM users WHERE id = ? AND deleted_at IS NULL`,
    [id]
  ) as any;
  return user || null;
};

// ── Supprimer un utilisateur (soft delete) ──
export const softDelete = async (id: number) => {
  await db.query(
    `UPDATE users SET deleted_at = NOW() WHERE id = ?`,
    [id]
  );
};

// ── Rechercher un utilisateur par nom ou email ──
export const search = async (query: string) => {
  const [rows] = await db.query(
    `SELECT id, nom, prenom, email, role, created_at
     FROM users
     WHERE deleted_at IS NULL
       AND (nom   LIKE ? 
        OR  prenom LIKE ? 
        OR  email  LIKE ?)
     ORDER BY created_at DESC
     LIMIT 20`,
    [`%${query}%`, `%${query}%`, `%${query}%`]
  );
  return rows;
};
