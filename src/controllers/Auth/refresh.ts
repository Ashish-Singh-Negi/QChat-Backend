import { NextFunction, Request, Response } from "express";
import httpStatus from "../../utils/response-codes";
import jwt, { JwtPayload, verify } from "jsonwebtoken";
import User from "../../models/User";

interface CustomPayload extends JwtPayload {
  _id: string;
}

const ACCESS_TOKEN_EXP = 1000 * 60 * 15;
const REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 7;

const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refresh = req.cookies["refresh-token"];

    console.log("REFRESH : ", refresh);

    if (!refresh) return httpStatus.redirect(res, "/login", "unauthorized");

    const jwtPayload = verify(
      refresh,
      process.env.JWT_SECRET!
    ) as CustomPayload;

    const user = await User.findById(jwtPayload._id).select("-password").exec();

    if (!user) return httpStatus.redirect(res, "/login", "User Not found");

    const accessToken = await jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: ACCESS_TOKEN_EXP,
      }
    );

    const refreshToken = await jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: REFRESH_TOKEN_EXP,
      }
    );

    user.access_token = accessToken;
    user.refresh_token = refreshToken;

    await user.save();

    res.cookie("access-token", accessToken, {
      httpOnly: true,
      maxAge: ACCESS_TOKEN_EXP,
      sameSite: "none",
      secure: true
    });

    res.cookie("refresh-token", refreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_EXP,
      sameSite: "none",
      secure: true
    });

    return httpStatus.created(
      res,
      {
        message: "New Tokens Created",
      },
      "Token Refreshed"
    );
  } catch (error) {
    console.error(error);
  }
};

export { refresh };
