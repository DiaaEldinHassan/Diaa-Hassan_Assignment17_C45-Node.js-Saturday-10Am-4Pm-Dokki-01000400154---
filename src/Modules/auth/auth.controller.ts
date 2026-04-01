import { Router, Request, Response, NextFunction } from "express";
import { auth } from "./auth.service";
import { validate } from "../../Middlewares";
import { authorization } from "../../Middlewares/authorization.middleware";
import { roleEnum } from "../../common";
import {
  signInSchema,
  signUpSchema,
  confirmOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "./auth.validation";

const authedRoles = [
  roleEnum.USER,
  roleEnum.ADMIN,
  roleEnum.MODERATOR,
  roleEnum.SUPER_ADMIN,
];

export const router: Router = Router();

router.post(
  "/signUp",
  validate(signUpSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const out = await auth.handleSignUp(req.body);
      res.status(out.statusCode).json(out.body);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/confirmOtp",
  validate(confirmOtpSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const out = await auth.handleConfirmOtp(req.body);
      res.status(out.statusCode).json(out.body);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/signIn",
  validate(signInSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const out = await auth.handleSignIn(req.body);
      res.status(out.statusCode).json(out.body);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/forgotPassword",
  validate(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const out = await auth.handleForgotPassword(req.body);
      res.status(out.statusCode).json(out.body);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/resetPassword",
  validate(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const out = await auth.handleResetPassword(req.body);
      res.status(out.statusCode).json(out.body);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/password",
  authorization(authedRoles, "login"),
  validate(updatePasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const out = await auth.handleUpdatePassword(req.user!._id, req.body);
      res.status(out.statusCode).json(out.body);
    } catch (error) {
      next(error);
    }
  },
);

router.post("/logout", authorization(authedRoles, "logout"));
