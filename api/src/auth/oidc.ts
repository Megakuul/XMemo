import { Request, Response, NextFunction } from "express";

/**
 * Intersection middleware which gracefully blocks of requests if OIDC is not enabled
 * 
 * Middleware prevents usage of OIDC middlewares, if they are not initalized
 */
export const checkOIDCAvailability = (_: Request, res: Response, next: NextFunction) => {
  if (!process.env.OIDC_ENABLED) {
    return res.status(503).json({
      message: 'Error accessing OpenID Connect endpoint', 
      error: "No OpenID Connect provider is connected!" 
    });
  }
  next();
}