import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      const isZodError = error instanceof ZodError || error?.name === 'ZodError' || Array.isArray(error?.issues) || Array.isArray(error?.errors);
      if (isZodError) {
        const zodIssues = error?.issues || error?.errors || [];
        const errors = zodIssues.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : err.path,
          message: err.message
        }));
        const firstMessage = errors[0]?.message || 'Validation failed.';
        return res.status(400).json({ 
          success: false, 
          message: firstMessage, 
          data: null, 
          errors 
        });
      } else {
        next(error);
      }
    }
  };
};
