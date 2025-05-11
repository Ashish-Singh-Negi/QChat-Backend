import { Request, Response } from "express";
import httpStatus from "../../utils/response-codes";
import Room from "../../models/Room";

const getChatRoomInfo = async (req: Request, res: Response) => {
  try {
    const { crid } = req.params;

    if (!crid) return httpStatus.badRequest(res, "chat room Id is required");

    const chatRoomInfo = await Room.findById(crid);

    if (!chatRoomInfo) return httpStatus.notFound(res, "chat room Not Found");

    return httpStatus.success(
      res,
      chatRoomInfo,
      "Chat room Info fetched successfully"
    );
  } catch (error) {
    return httpStatus.internalServerError(res, "An error occured");
  }
};

export { getChatRoomInfo };
