import { Request, Response, NextFunction } from 'express';

export type ValidationRule = {
  field: string;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  enum?: string[];
};

export const validateBody = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`Field '${rule.field}' is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (rule.type === 'number') {
          const num = Number(value);
          if (isNaN(num)) {
            errors.push(`Field '${rule.field}' must be a valid number`);
          } else {
            if (rule.min !== undefined && num < rule.min) {
              errors.push(`Field '${rule.field}' must be >= ${rule.min}`);
            }
            if (rule.max !== undefined && num > rule.max) {
              errors.push(`Field '${rule.field}' must be <= ${rule.max}`);
            }
          }
        } else if (rule.type === 'string') {
          if (typeof value !== 'string') {
            errors.push(`Field '${rule.field}' must be a string`);
          } else if (rule.min !== undefined && value.length < rule.min) {
            errors.push(`Field '${rule.field}' must be at least ${rule.min} characters`);
          }
        }

        if (rule.enum && !rule.enum.includes(String(value))) {
          errors.push(
            `Field '${rule.field}' must be one of: ${rule.enum.join(', ')}`
          );
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    next();
  };
};
