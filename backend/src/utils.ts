import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}
