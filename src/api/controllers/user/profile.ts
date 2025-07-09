import { Request, Response } from "express";
import User from "../../../models/User";
import httpStatus from "../../../utils/response-codes";
import UserService from "../../../services/user";
import expressAsyncHandler from "express-async-handler";
import BadRequestError from "../../../errors/BadRequestError";
import UserRepository from "../../../repositories/UserRepository";

const getProfile = expressAsyncHandler(async (req: Request, res: Response) => {
  console.log(req.url);
  const { uid } = req;

  const userServiceinstance = new UserService(new UserRepository(User));
  const { userProfile } = await userServiceinstance.getUserProfile(uid!);

  return httpStatus.success(res, userProfile, "Profile Found");
});

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
