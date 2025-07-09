import { NextFunction, Request, Response } from "express";
import BadRequestError from "../errors/BadRequestError";
import NotFoundError from "../errors/NotFoundError";
import ConflictError from "../errors/ConflictError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // handled errors

  if (err instanceof BadRequestError) {
    const { statusCode, errors, logging } = err;
    if (logging) {
      console.error({
        code: err.statusCode,
        error: err.errors,
        stack: err.stack,
        endpoint: req.originalUrl,
        method: req.method,
        timestamp: new Date().toLocaleDateString(),
      });
    }

    res.status(statusCode).json({ errors });
  }

  if (err instanceof NotFoundError) {
    const { statusCode, errors, logging } = err;
    if (logging) {
      console.error({
        code: err.statusCode,
        error: err.errors,
        stack: err.stack,
        endpoint: req.originalUrl,
        method: req.method,
        timestamp: new Date().toLocaleDateString(),
      });
    }

    res.status(statusCode).json({ errors });
  }

  if (err instanceof ConflictError) {
    const { statusCode, errors, logging } = err;
    if (logging) {
      console.error({
        code: err.statusCode,
        error: err.errors,
        stack: err.stack,
        endpoint: req.originalUrl,
        method: req.method,
        timestamp: new Date().toLocaleDateString(),
      });
    }

    res.status(statusCode).json({ errors });
  }

  // unhandled error
  console.error("Unhandled error : ", JSON.stringify(err, null, 2));
  res.status(500).send({
    errors: [{ message: "Something went wrong." }],
  });
};
