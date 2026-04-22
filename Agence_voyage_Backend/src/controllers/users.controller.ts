import { Request, Response } from 'express';
import * as usersService from '../services/users.service';

export const getAll = async (req: Request, res: Response) => {
  const page  = parseInt(req.query.page  as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const data  = await usersService.findAll(page, limit);
  res.json(data);
};

export const getOne = async (req: Request, res: Response) => {
  const id   = parseInt(req.params['id'] as string);  
  const user = await usersService.findById(id);
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] as string);   
  await usersService.softDelete(id);
  res.json({ message: 'Compte supprimé avec succès' });
};

export const searchUsers = async (req: Request, res: Response) => {
  const q    = req.query.q as string;
  const data = await usersService.search(q || '');
  res.json(data);
};