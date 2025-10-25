import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JWTPayload } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  // Also check cookie
  const cookieToken = req.cookies?.accessToken;

  const finalToken = token || cookieToken;

  if (!finalToken) {
    return res.status(401).json({ 
      message: "Authentication required. Please log in." 
    });
  }

  try {
    const payload = verifyAccessToken(finalToken);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ 
      message: "Invalid or expired token. Please log in again." 
    });
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const cookieToken = req.cookies?.accessToken;
  const finalToken = token || cookieToken;

  if (finalToken) {
    try {
      const payload = verifyAccessToken(finalToken);
      req.user = payload;
    } catch {
      // Token invalid, but that's ok for optional auth
      req.user = undefined;
    }
  }

  next();
}

