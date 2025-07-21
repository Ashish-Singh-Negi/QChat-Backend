import { Request, Response } from "express";
import FriendService from "../../services/friend";
import FriendRepository from "../../repositories/FirendRepository";
import User from "../../models/User";
import httpStatus from "../../utils/response-codes";
import { validateObjectId } from "../../utils/validators/mongoId.validator";
import expressAsyncHandler from "express-async-handler";

/**
 * GET /friends/:fid
 * req-body {}
 */
const getFriendDetails = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { fid } = req.params;
    validateObjectId(fid, "Friend Id");

    const friendServiceInstance = new FriendService(new FriendRepository(User));
    const { friendProfile } = await friendServiceInstance.getFriendProfile(fid);

    return httpStatus.success(res, friendProfile, "Profile Found");
  }
);

export { getFriendDetails };
