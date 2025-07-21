import { Request, Response } from "express";

import httpStatus from "../../utils/response-codes";
import expressAsyncHandler from "express-async-handler";

import AuthService from "../../services/auth";

import User from "../../models/User";
import UserRepository from "../../repositories/UserRepository";

const ACCESS_TOKEN_EXP = 1000 * 60 * 15;
const REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 7;

/**
 * POST : /login
 * req-body {
 *  username: "mango",
 *  password: "mango1234"
 * }
 */
const signinController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { username, password } = req.body;

    console.log(username, password);

    const authServiceInstance = new AuthService(new UserRepository(User));
    const { user, access_token, refresh_token } =
      await authServiceInstance.SignIn(username, password);

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

    return httpStatus.success(res, user, "signin Succcessful");
  }
);

export { signinController };
