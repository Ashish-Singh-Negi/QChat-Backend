import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import BadRequestError from "../../errors/BadRequestError";
import AuthService from "../../services/auth.service";
import UserRepository from "../../repositories/UserRepository";
import User from "../../models/User";
import httpStatus from "../../utils/response-codes";
import { IUserInputDTO } from "../../interfaces/IUser";

/**
 * POST : /register
 * req-body {
 *  username: "mango",
 *  email: "mango@gmail.com",
 *  password: "mango123",
 *  confirmPassword: "mango123"
 * }
 */
const signupController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    const authServiceIntance = new AuthService(new UserRepository(User));
    const { user } = await authServiceIntance.Signup({
      username: username,
      email: email,
      password: password,
    } as IUserInputDTO);

    return httpStatus.created(res, user, "Signup Succesfully");
  }
);

export { signupController };
