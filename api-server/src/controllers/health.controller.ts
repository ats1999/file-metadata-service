import { Request, Response } from "express";

export const healthCheck = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
  });
};
