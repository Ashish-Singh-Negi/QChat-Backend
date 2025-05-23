import { Request, Response } from "express";
import httpStatus from "../../utils/response-codes";
import User from "../../models/User";

const removeFriend = async (req: Request, res: Response) => {
  try {
    const { fid } = req.params;
    const uid = req.uid;

    if (!fid) {
      return httpStatus.badRequest(res, "Friend ID is required.");
    }

    // Fetch user and friend details while excluding unnecessary fields
    const user = await User.findById(uid).select(
      "-password -contactRoomList -createdAt -updatedAt -profilePic"
    );
    if (!user) {
      return httpStatus.notFound(res, "User not found.");
    }

    const friend = await User.findById(fid).select(
      "-password -contactRoomList -createdAt -updatedAt -profilePic"
    );
    if (!friend) {
      return httpStatus.notFound(res, "Friend not found.");
    }

    // Remove friend ID from user's friend list
    const friendIndex = user.friendList.indexOf(fid);
    if (friendIndex === -1) {
      return httpStatus.notFound(
        res,
        "Friend is not in the user's friend list."
      );
    }
    user.friendList.splice(friendIndex, 1);

    // Remove user ID from friend's friend list
    const userIndex = friend.friendList.indexOf(uid);
    if (userIndex === -1) {
      return httpStatus.notFound(
        res,
        "User is not in the friend's friend list."
      );
    }
    friend.friendList.splice(userIndex, 1);

    // all right, save it
    await user.save();
    await friend.save();

    return httpStatus.noContent(res);
  } catch (error) {
    console.error("Error removing friend:", error);
    return httpStatus.internalServerError(
      res,
      "An error occurred while removing the friend."
    );
  }
};

export { removeFriend };
