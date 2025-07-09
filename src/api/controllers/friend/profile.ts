import { Request, Response } from "express";
import httpStatus from "../../../utils/response-codes";
import User from "../../../models/User";
import FriendService from "../../../services/friend";
import FriendRepository from "../../../repositories/FirendRepository";

const getFriendDetails = async (req: Request, res: Response) => {
  try {
    const { fid } = req.params;

    const friendServiceInstance = new FriendService(new FriendRepository(User));
    const { friendProfile } = await friendServiceInstance.getFriendProfile(fid);

    return httpStatus.success(res, friendProfile, "F Profile Found");
  } catch (error) {
    console.error(error);
    return httpStatus.internalServerError(res, "Internal Server Error :(");
  }
};

export { getFriendDetails };
