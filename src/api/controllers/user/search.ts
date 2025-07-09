import { Request, Response } from "express";
import httpStatus from "../../../utils/response-codes";
import User from "../../../models/User";
import UserService from "../../../services/user";
import expressAsyncHandler from "express-async-handler";
import UserRepository from "../../../repositories/UserRepository";

const searchUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const { username } = req.query;
  if (!username) return httpStatus.badRequest(res, "username is required");

  const userServiceinstance = new UserService(new UserRepository(User));
  const { usernames } = await userServiceinstance.searchWithUsername(
    username as string
  );

  console.log(usernames);

  return httpStatus.success(res, usernames, "Founded");
});

export { searchUser };
