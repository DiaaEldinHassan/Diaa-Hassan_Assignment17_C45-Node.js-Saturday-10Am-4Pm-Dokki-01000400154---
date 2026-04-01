import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;

      if (validatedData.body) req.body = validatedData.body;
      if (validatedData.query) {
        const allowedQueryKeys = Object.keys(validatedData.query);
        Object.keys(req.query).forEach(key => { if (!allowedQueryKeys.includes(key)) delete (req.query as any)[key]; });
        allowedQueryKeys.forEach(key => { (req.query as any)[key] = validatedData.query[key]; });
      }
      if (validatedData.params) {
        const allowedParamKeys = Object.keys(validatedData.params);
        Object.keys(req.params).forEach(key => { if (!allowedParamKeys.includes(key)) delete (req.params as any)[key]; });
        allowedParamKeys.forEach(key => { (req.params as any)[key] = validatedData.params[key]; });
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation failed",
          errors: (error as any).errors || (error as any).issues,
        });
        return;
      }
      next(error);
    }
  };
};
