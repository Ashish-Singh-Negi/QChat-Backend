import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import httpStatus from "../../utils/response-codes";
import config from "../../config";
import { CJwtPayload } from "../../middlewares/verifyUser.middlewares";
import AuthService from "../../services/auth";
import UserRepository from "../../repositories/UserRepository";
import User from "../../models/User";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXP = 1000 * 60 * 15;
const REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 7;

/**
 * POST : /refresh
 * req-body {}
 */
const refreshController = expressAsyncHandler(
  async (req: Request, res: Response) => {
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
  }
);

export { refreshController };
