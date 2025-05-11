import { Request, Response } from "express";

import httpStatus from "../../utils/response-codes";
import User from "../../models/User";

const inviteToChatRoom = async (req: Request, res: Response) => {
  try {
    const { fid, crid } = req.params;

    const uid = req.uid;

    console.log(fid, " & ", crid);

    if (!fid || !crid)
      return httpStatus.badRequest(res, "Friend Id & chat room Id is required");

    const friend = await User.findById(fid).select("-password");

    

    return httpStatus.success(res, {}, "Invite send successfully");
  } catch (error) {
    console.error(error);
    return httpStatus.internalServerError(res, "An error occurred");
  }
};

export { inviteToChatRoom };
