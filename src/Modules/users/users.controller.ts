import { Router } from "express";
import { authorization } from "../../Middlewares/authorization.middleware";
import { roleEnum } from "../../common";
import { NextFunction, Request, Response } from "express";

export const router: Router = Router();

router.get(
  "/",
  authorization([
    roleEnum.ADMIN,
    roleEnum.SUPER_ADMIN,
    roleEnum.MODERATOR,
    roleEnum.USER,
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ message: "Hello World" });
    } catch (error) {
      next(error);
    }
  },
);
