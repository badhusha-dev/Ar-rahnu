import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './auth';

export type UserRole = 'teller' | 'manager' | 'auditor' | 'admin';

const roleHierarchy: Record<UserRole, number> = {
  teller: 1,
  manager: 2,
  auditor: 3,
  admin: 4,
};

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = req.user.role as UserRole;
    const userRoleLevel = roleHierarchy[userRole] || 0;
    
    const hasPermission = allowedRoles.some(role => {
      const requiredLevel = roleHierarchy[role] || 0;
      return userRoleLevel >= requiredLevel;
    });

    if (!hasPermission) {
      return res.status(403).json({ 
        message: 'Insufficient permissions', 
        required: allowedRoles,
        current: userRole,
      });
    }

    next();
  };
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole('admin')(req, res, next);
}

export function requireManagerOrAbove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole('manager', 'auditor', 'admin')(req, res, next);
}
