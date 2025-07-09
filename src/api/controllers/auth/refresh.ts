import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";

import { CJwtPayload } from "../../../middlewares/verify";

import User from "../../../models/User";

import config from "../../../config";

import AuthService from "../../../services/auth";

import httpStatus from "../../../utils/response-codes";
import UserRepository from "../../../repositories/UserRepository";

const ACCESS_TOKEN_EXP = 1000 * 60 * 15;
const REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 7;

const refresh = expressAsyncHandler(async (req: Request, res: Response) => {
  const refresh = req.cookies["refresh-token"];
  if (!refresh) return httpStatus.redirect(res, "/signin", "unauthorized");

  let jwtPayload;
  try {
    jwtPayload = verify(refresh, config.jwtSecret!) as CJwtPayload;
  } catch (error) {
    return httpStatus.redirect(res, "/signin", "User Not found");
  }

  const authServiceInstance = new AuthService(new UserRepository(User));
  const { access_token, refresh_token } = authServiceInstance.refreshToken({
    _id: jwtPayload._id,
    username: jwtPayload.name,
  });

  res.cookie("access-token", access_token, {
    httpOnly: true,
    maxAge: ACCESS_TOKEN_EXP,
    sameSite: "none",
    secure: true,
  });

  res.cookie("refresh-token", refresh_token, {
    httpOnly: true,
    maxAge: REFRESH_TOKEN_EXP,
    sameSite: "none",
    secure: true,
  });

  return httpStatus.created(
    res,
    {
      message: "New Tokens Created",
    },
    "Token Refreshed"
  );
});

export { refresh };
