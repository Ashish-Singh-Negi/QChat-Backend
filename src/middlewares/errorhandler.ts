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
    const { statusCode, errors } = err;

    console.error(" BadRequestError : ", {
      code: err.statusCode,
      error: err.errors,
      endpoint: req.originalUrl,
      method: req.method,
      timestamp: new Date().toLocaleString(),
    });

    res.status(statusCode).json({ success: false, ...errors });
  }

  if (err instanceof NotFoundError) {
    const { statusCode, errors } = err;
    console.error({
      code: err.statusCode,
      error: err.errors,
      stack: err.stack,
      endpoint: req.originalUrl,
      method: req.method,
      timestamp: new Date().toLocaleString(),
    });

    res.status(statusCode).json({ errors });
  }

  if (err instanceof ConflictError) {
    const { statusCode, errors } = err;
    console.error({
      code: err.statusCode,
      error: err.errors,
      stack: err.stack,
      endpoint: req.originalUrl,
      method: req.method,
      timestamp: new Date().toLocaleString(),
    });

    res.status(statusCode).json({ errors });
  }

  // unhandled error
  console.error("Unhandled error : ", JSON.stringify(err, null, 2));
  res.status(500).send({
    errors: [{ message: "Something went wrong." }],
  });
};
