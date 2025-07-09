import { NextFunction, Request, Response } from "express";
import httpStatus from "../../../utils/response-codes";
import User from "../../../models/User";
import AuthService from "../../../services/auth";
import BadRequestError from "../../../errors/BadRequestError";
import expressAsyncHandler from "express-async-handler";
import UserRepository from "../../../repositories/UserRepository";

const ACCESS_TOKEN_EXP = 1000 * 60 * 15;
const REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 7;

const login = expressAsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    // Validate required feilds
    if (!username || !password) {
      throw new BadRequestError({
        message: "username and password is required",
      });
    }

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

    return httpStatus.success(res, user, "Login Succcessful");
  }
);

export { login };
