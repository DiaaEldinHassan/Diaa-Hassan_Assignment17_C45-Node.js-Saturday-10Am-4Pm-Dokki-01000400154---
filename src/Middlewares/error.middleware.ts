import { NextFunction, Request, Response } from "express";
import { IError } from "../common";



export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const statusCode = err.statusCode || 500;
  const errorResponse: IError = {
    success: false,
    error: err.message || "Internal Server Error",
    code: statusCode,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };
  res.status(statusCode).json(errorResponse);
};
