/// <reference path="../../express.d.ts" />

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface CJwtPayload extends JwtPayload {
  _id: string;
  name: string;
}

const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies["access-token"];

    if (!token) {
      res.status(401).json({
        error: "unauthorized",
      });
    }

    const isValid = jwt.verify(token, process.env.JWT_SECRET!) as CJwtPayload;

    if (!isValid) {
      res.status(401).json({
        error: "Invalid token",
      });
    }

    req.uid = isValid._id;
    req.name = isValid.name;

    next();
  } catch (error) {
    console.error(error);
  }
};

export { verify };
