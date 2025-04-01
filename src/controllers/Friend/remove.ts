import { Request, Response } from "express";
import httpStatus from "../../utils/response-codes";
import User from "../../models/User";

const removeFriend = async (req: Request, res: Response) => {
  try {
    const { fid } = req.body;

    const uid = req.uid;

    if (!fid) return httpStatus.badRequest(res, "Invalid FID");

    const user = await User.findById(uid).select("-password");

    const index = user.friends.indexOf(fid);

    if (index === -1) return httpStatus.notFound(res, "Already Removed");

    user.friends.splice(index, 1);

    await user.save();

    return httpStatus.success(res, user, "Friend Removed");
  } catch (error) {
    console.error(error);
    return httpStatus.internalServerError(res, "Failed");
  }
};

export { removeFriend };
