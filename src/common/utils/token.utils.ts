import jwt from "jsonwebtoken";
import { jwtSkAccess, jwtSkRefresh } from "../../config/config.service";
import { Token } from "../interfaces";

export const generateToken = (payload: any): { accessToken: string; refreshToken: string } => {
  try {
    const sanitizedPayload = {
      _id: String(payload._id),
      role: payload.role,
      email: payload.email,
    };

    const accessToken: string = jwt.sign(sanitizedPayload, jwtSkAccess, { expiresIn: "1h" });
    const refreshToken: string = jwt.sign(sanitizedPayload, jwtSkRefresh, { expiresIn: "7d" });

 
    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

export const verifyAccessToken = (token: string): Token => {
  try {
 
    return jwt.verify(token, jwtSkAccess) as Token;
  } catch (error: any) {
    console.error("[VERIFY FAILED] secret_last4:", jwtSkAccess.slice(-4), "error:", error.message);
    throw error;
  }
};

export const verifyRefreshToken = (token: string): Token => {
  try {
    return jwt.verify(token, jwtSkRefresh) as Token;
  } catch (error: any) {
    console.error("Refresh Token verification failed:", error.message);
    throw error;
  }
};


export const verifyToken = (token: string): Token => {
  return verifyAccessToken(token);
};