import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db, UserRow } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-artisanhub-jwt-secret-key-2025';

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'customer' | 'creator' | 'admin';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
  currentUser?: UserRow;
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;

  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
    return;
  }

  const user = db.users.find(u => u.id === payload.userId);
  if (!user) {
    res.status(401).json({ success: false, error: 'User no longer exists' });
    return;
  }

  req.user = payload;
  req.currentUser = user;
  next();
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;

  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = db.users.find(u => u.id === payload.userId);
      if (user) {
        req.user = payload;
        req.currentUser = user;
      }
    }
  }
  next();
}

export function requireCreatorMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const creator = db.getCreatorByUserId(req.user.userId);
  if (!creator && req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Creator account required' });
    return;
  }

  next();
}
