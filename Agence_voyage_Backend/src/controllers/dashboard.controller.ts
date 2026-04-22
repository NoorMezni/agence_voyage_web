 
import { Request, Response } from 'express';
import * as s from '../services/dashboard.service';

export const getStats = async (req: Request, res: Response) => {
  try {
    const [total, newReg, deleted, byMonth, byRole] = await Promise.all([
      s.getTotalUsers(),
      s.getNewRegistrations(),
      s.getDeletedAccounts(),
      s.getRegistrationsByMonth(),
      s.getRoleDistribution(),
    ]);

    res.json({ total, newReg, deleted, byMonth, byRole });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};