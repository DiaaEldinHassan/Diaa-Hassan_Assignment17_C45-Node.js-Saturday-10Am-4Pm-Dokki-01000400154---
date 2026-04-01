import { roleEnum } from "../common/enums/role.enum"
import { NextFunction, Request, Response } from "express"
import { getSession, setSession, verifyToken } from "../common";
import { Token } from "../common/interfaces";

import jwt from "jsonwebtoken";
import { usersRepo } from "../DB";

declare global {
  namespace Express {
    interface Request {
      user?: Token | null;
    }
  }
};

export function authorization(aud = [roleEnum.USER], process = "login") {
  return async (req:Request, res:Response, next:NextFunction):Promise<void> => {
    try {
      const header = (req.headers.authorization || req.headers.Authorization) as string | undefined;
      if (!header) throw new Error("Please provide token");

      const token = header.split(" ")[1];
      if (!token) throw new Error("Invalid token format");

      if (process === "login") {
        const isRevoked = await getSession(`revoked:${token}`);
        if (isRevoked) {
          throw new Error(
            "Token has been revoked. Please login again.",
          );
        }

        const decoded:Token = verifyToken(token);
        if (!aud.includes(decoded.role))
          throw new Error("Forbidden");

        const user = await usersRepo.findById(decoded._id) ;
        if (!user) {
          throw new Error(
            "User no longer exists. Please register again.",
          );
        }

        req.user = decoded;
        next();
      } else {
        const decoded = jwt.decode(token) as jwt.JwtPayload;
        const now = Math.floor(Date.now() / 1000);
        const ttl = (decoded?.exp || now) - now;

        if (ttl > 0) {
          await setSession(`revoked:${token}`, "true", ttl);
        }

        return res.status(200).json({ message: "Logged out successfully" }) as any;
      }
    } catch (error) {
      next(error);
    }
  };
}

export function optionalAuth() {
  return async (req:Request, res:Response, next:NextFunction):Promise<void> => {
    try {
      const header = (req.headers.authorization || req.headers.Authorization) as string | undefined;
      
      if (!header) {
        req.user = null;
        return next();
      }

      const token = header.split(" ")[1];
      
      if (!token) {
        req.user = null;
        return next();
      }

      const isRevoked = await getSession(`revoked:${token}`);
      if (isRevoked) {
        req.user = null;
        return next();
      }

      const decoded: Token = verifyToken(token);

      const user = await usersRepo.findById(decoded._id);
      if (!user) {
        req.user = null;
        return next();
      }

      req.user = decoded;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  };
}
