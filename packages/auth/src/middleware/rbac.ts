import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";

type UserRole = "customer" | "teller" | "manager" | "admin";
type ModuleScope = "rahnu" | "bse" | "admin";

/**
 * Middleware to check if user has required role
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Insufficient permissions. Your role does not have access to this resource." 
      });
    }

    next();
  };
}

/**
 * Middleware to check if user has required module scope
 */
export function requireScope(...allowedScopes: ModuleScope[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Admin scope has access to everything
    if (req.user.scope === "admin") {
      return next();
    }

    if (!allowedScopes.includes(req.user.scope)) {
      return res.status(403).json({ 
        message: `Access denied. This resource requires ${allowedScopes.join(" or ")} module access.` 
      });
    }

    next();
  };
}

/**
 * Middleware to check branch access
 * Ensures user can only access resources in their branch
 */
export function requireBranchAccess(getBranchIdFromReq?: (req: AuthenticatedRequest) => string | undefined) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Admins can access all branches
    if (req.user.role === "admin") {
      return next();
    }

    // Get branch ID from request (query, params, or body)
    const requestedBranchId = getBranchIdFromReq 
      ? getBranchIdFromReq(req)
      : req.params.branchId || req.query.branchId || req.body.branchId;

    // If no branch specified in request, use user's branch
    if (!requestedBranchId) {
      return next();
    }

    // Check if user's branch matches requested branch
    if (req.user.branchId && requestedBranchId !== req.user.branchId) {
      return res.status(403).json({ 
        message: "Access denied. You can only access resources in your assigned branch." 
      });
    }

    next();
  };
}

/**
 * Combined RBAC middleware - checks role, scope, and branch
 */
export function requireAccess(config: {
  roles?: UserRole[];
  scopes?: ModuleScope[];
  checkBranch?: boolean;
}) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check role
    if (config.roles && !config.roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Insufficient role permissions" 
      });
    }

    // Check scope (admin scope bypasses scope check)
    if (config.scopes && req.user.scope !== "admin" && !config.scopes.includes(req.user.scope)) {
      return res.status(403).json({ 
        message: `Access denied. Requires ${config.scopes.join(" or ")} module access.` 
      });
    }

    // Check branch access (admin role bypasses branch check)
    if (config.checkBranch && req.user.role !== "admin") {
      const requestedBranchId = req.params.branchId || req.query.branchId || req.body.branchId;
      if (requestedBranchId && req.user.branchId && requestedBranchId !== req.user.branchId) {
        return res.status(403).json({ 
          message: "Access denied. Branch access restricted." 
        });
      }
    }

    next();
  };
}

// Convenience functions for common access patterns
export const requireAdmin = requireRole("admin");
export const requireManagerOrAbove = requireRole("manager", "admin");
export const requireStaff = requireRole("teller", "manager", "admin");

export const requireRahnuScope = requireScope("rahnu", "admin");
export const requireBseScope = requireScope("bse", "admin");
export const requireAdminScope = requireScope("admin");

