import User from "../../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import httpStatus from "../../utils/response-codes";
import { Request, Response } from "express";

const ACCESS_TOKEN_EXP = 1000 * 60 * 15;
const REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 7;

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate required feilds
    if (!username || !password) {
      return httpStatus.badRequest(res, "All feilds required");
    }

    // console.log("username : ", username);
    // console.log("password : ", password);

    // Find user by username
    const user = await User.findOne({ username }).exec();
    // console.log("user : ", user);
    if (!user) {
      return httpStatus.badRequest(res, "Invalid username or password");
    }

    // Compare password using bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch!) {
      return httpStatus.badRequest(res, "Invalid username or password");
    }

    // Login Successfull
    const userDetails = await User.findOne({ username })
      .select("-password")
      .exec();

    const accessToken = jwt.sign(
      { _id: userDetails._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: ACCESS_TOKEN_EXP,
      }
    );

    const refreshToken = jwt.sign(
      { _id: userDetails._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: REFRESH_TOKEN_EXP,
      }
    );

    // userDetails.access_token = accessToken;
    // userDetails.access_token_expiry = "15m";

    // userDetails.refresh_token = refreshToken;
    // userDetails.refresh_token_expiry = "7d";

    await userDetails.save();

    res.cookie("access-token", accessToken, {
      httpOnly: true,
      maxAge: ACCESS_TOKEN_EXP,
    });

    res.cookie("refresh-token", refreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_EXP,
    });

    httpStatus.success(res, userDetails, "Login Succcessful");
  } catch (error) {
    console.error(error);
    httpStatus.internalServerError(res, "Login Failed");
  }
};

export { login };
