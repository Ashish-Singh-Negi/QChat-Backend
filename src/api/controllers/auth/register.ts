import { Request, Response } from "express";
import httpStatus from "../../../utils/response-codes";
import User from "../../../models/User";
import AuthService from "../../../services/auth";
import { IUserInputDTO } from "../../../interfaces/IUser";
import BadRequestError from "../../../errors/BadRequestError";
import expressAsyncHandler from "express-async-handler";
import UserRepository from "../../../repositories/UserRepository";

const register = expressAsyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, confirmPassword } = req.body;

  const usernameIs = username.trim();
  const emailIs = email.trim();
  const passwordIs = password.trim();
  const confirmPasswordIs = confirmPassword.trim();

  // validate required feilds
  if (!usernameIs || !emailIs || !passwordIs || !confirmPasswordIs) {
    throw new BadRequestError({ message: "All feild are required" });
  }

  // validate password and confirm password
  if (passwordIs !== confirmPasswordIs) {
    throw new BadRequestError({
      message: "password not match",
      context: {
        endpoint: req.originalUrl,
        method: req.method,
        details: "password and confirm password must be same",
      },
    });
  }

  const authServiceIntance = new AuthService(new UserRepository(User));
  const { user } = await authServiceIntance.Signup({
    username: usernameIs,
    email: emailIs,
    password: passwordIs,
  } as IUserInputDTO);

  return httpStatus.created(res, user, "Registered Succesfully");
});

export { register };
