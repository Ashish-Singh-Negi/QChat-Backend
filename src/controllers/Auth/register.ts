import { NextFunction, Request, Response } from "express";
import httpStatus from "../../utils/response-codes";
import bcrypt from "bcrypt";
import User from "../../models/User";

const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    console.log("register route");

    const usernameIs = username.trim();
    const emailIs = email.trim();
    const passwordIs = password.trim();
    const confirmPasswordIs = confirmPassword.trim();

    // validate required feilds
    if (!usernameIs || !emailIs || !passwordIs || !confirmPasswordIs) {
      return httpStatus.badRequest(res, "missing required feilds");
    }

    // validate password and confirm password
    if (passwordIs !== confirmPasswordIs) {
      return httpStatus.badRequest(
        res,
        "password and confirm password Not Matched"
      );
    }

    const isUserRegisterd = await User.findOne({ username: usernameIs })
      .select("-password")
      .lean()
      .exec();

    if (isUserRegisterd) {
      return httpStatus.badRequest(res, "User already registerd");
    }

    const hashPassword = await bcrypt.hash(passwordIs, 12);

    const user = await User.create({
      username: usernameIs,
      email: emailIs,
      password: hashPassword,
    });

    if (!user) {
      return httpStatus.internalServerError(res, "Registration Failed");
    }

    return httpStatus.created(res, user, "Registered Succesfully");
  } catch (error) {
    console.error(error);
    return httpStatus.internalServerError(res, "Registeration Failed");
  }
};

export { register };
