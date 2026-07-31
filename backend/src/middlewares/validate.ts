import { Request, Response, NextFunction } from 'express';
const { ZodError } = require('zod');
import { BadRequestError } from '../errors/AppError';

export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const zodErrors = (error as any).issues || (error as any).errors || [];
        const errors = zodErrors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        // We can throw our custom error or handle it directly here
        res.status(400).json({ 
          success: false, 
          message: 'Validation failed.', 
          data: null, 
          errors 
        });
      } else {
        next(error);
      }
    }
  };
};
