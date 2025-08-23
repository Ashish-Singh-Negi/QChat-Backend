import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import UserService from "../../services/user.service";
import UserRepository from "../../repositories/UserRepository";
import User from "../../models/User";
import httpStatus from "../../utils/response-codes";

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

/**
 * PATCH : /users/profile/chat/name  // TODO make endpoint more relatable
 * req-body {
 *    nickName: "Apple"
 *    chatId: 6880f10d020b8ea3f82f4a66
 * }
 */
const updateUserChat = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const username = req.name;
    const { nickName, chatId } = req.body;

    const userServiceinstance = new UserService(new UserRepository(User));
    const { updatedUserProfile } = await userServiceinstance.updateUserChatName(
      username!,
      chatId,
      nickName
    );

    return httpStatus.success(
      res,
      updatedUserProfile,
      "Name Changed Successfully"
    );
  }
);

export { getProfile, updateProfile, updateUserChat };
