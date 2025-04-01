/// <reference path="../../express.d.ts" />

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";


interface CJwtPayload extends JwtPayload {
  _id: string;
}

const verify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["access-token"];

    console.log("Access : ", token);

    if (!token) {
      res.status(401).json({
        error: "unauthorized",
      });

      return;
    }

    const isValid = jwt.verify(token, process.env.JWT_SECRET!) as CJwtPayload;

    req.uid = isValid._id;

    if (!isValid) {
      res.status(401).json({
        error: "Invalid token",
      });
    }

    next();
  } catch (error) {
    console.error(error);
  }
};

export { verify };
