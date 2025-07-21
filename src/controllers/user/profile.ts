import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import UserService from "../../services/user";
import UserRepository from "../../repositories/UserRepository";
import User from "../../models/User";
import httpStatus from "../../utils/response-codes";
import BadRequestError from "../../errors/BadRequestError";

/**
 * GET : "/users/profile"
 * req-body {}
 */
const getProfile = expressAsyncHandler(async (req: Request, res: Response) => {
  const { uid } = req;

  const userServiceinstance = new UserService(new UserRepository(User));
  const { userProfile } = await userServiceinstance.getUserProfile(uid!);

  return httpStatus.success(res, userProfile, "Profile Found");
});

/**
 * PATCH : /users/profile
 * req-body {
 *  profilePic : "https://firebase.com/storage/user/profile.png",
 *  about : "Hey! you know anything about me ? No! let me tell you ...."
 * }
 */
const updateProfile = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { uid } = req;
    const { about, profilePic } = req.body;

    if (!about && !profilePic)
      throw new BadRequestError({
        message: "data is required to update profile",
      });

    const dto = {
      about,
      profilePic,
    };

    const userServiceinstance = new UserService(new UserRepository(User));
    const { updatedUserProfile } = await userServiceinstance.updateUserProfile(
      uid!,
      dto
    );

    return httpStatus.success(
      res,
      updatedUserProfile,
      "Profile Updated successfully"
    );
  }
);

export { getProfile, updateProfile };
