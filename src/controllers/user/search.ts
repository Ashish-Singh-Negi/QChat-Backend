import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import BadRequestError from "../../errors/BadRequestError";
import UserService from "../../services/user";
import UserRepository from "../../repositories/UserRepository";
import User from "../../models/User";
import httpStatus from "../../utils/response-codes";

/**
 * GET : /users?username=mango
 * req-query {
 *  username: "mango"
 * }
 * req-body {}
 */
const searchUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const { username } = req.query;
  if (!username) throw new BadRequestError({ message: "username is required" });

  const userServiceinstance = new UserService(new UserRepository(User));
  const { usernames } = await userServiceinstance.searchWithUsername(
    username as string
  );

  return httpStatus.success(res, usernames, "Founded");
});

export { searchUser };
