import { NextFunction, Request, Response } from "express";
import { AnySchema } from "joi";

/**
 * @param schema - Joi schema to validate the request body
 * @returns - Middleware function to validate the request body
 */
export const validateRequestBody = (schema: AnySchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Validating request body");
      req.body = await schema.validateAsync(req.body);
      console.log("Request body is valid");
      next();
    } catch (error: any) {
      // If the validation fails,
      console.log("Request body is invalid");
      console.log(error);
      if (error.name === "ValidationError") {
        res.status(400).json({
          message: "Invalid request body",
          success: false,
          error: error,
        });
      }
    }
  };
};

/**
 * @param schema - Joi schema to validate the request body
 * @returns - Middleware function to validate the request query params
 */
export const validateQueryParams = (schema: AnySchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.query);
      console.log("Query params are valid");
      next();
    } catch (error) {
      // If the validation fails,
      console.error(error);
      res.status(400).json({
        message: "Invalid query params",
        success: false,
        error: error,
      });
    }
  };
};
