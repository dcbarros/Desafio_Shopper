import { Request, Response, NextFunction } from 'express';
import { validationResult, checkSchema, Schema } from 'express-validator';

export const validateRequest = (schema: Schema) => {
  return [
    ...checkSchema(schema),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => {
          const field = (err as any).param || (err as any).path || 'unknown';
          return `${field}: ${err.msg}`;
        }).join(', ');

        return res.status(400).json({
          error_code: 'INVALID_DATA',
          error_description: formattedErrors,
        });
      }

      next();
    },
  ];
};
