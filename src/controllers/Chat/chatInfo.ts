import { Request, Response } from "express";
import httpStatus from "../../utils/response-codes";
import Room from "../../models/Room";
import Message from "../../models/Message";

const getChatRoomDetails = async (req: Request, res: Response) => {
  try {
    const { crid } = req.params;
    const { filter } = req.query;

    console.log("Filter : ", filter);

    if (!crid) return httpStatus.badRequest(res, "chat room Id is required");

    let chatRoomDetails;

    if (filter) {
      chatRoomDetails = await Room.findById(crid).select(`${filter}`).lean();
    } else {
      chatRoomDetails = await Room.findById(crid).lean();
    }

    if (!chatRoomDetails)
      return httpStatus.notFound(res, "chat details Not Found");

    return httpStatus.success(
      res,
      chatRoomDetails,
      "Chat room Details fetched successfully"
    );
  } catch (error) {
    return httpStatus.internalServerError(res, "An error occured");
  }
};

/**
 * @api {PATCH} /users/chats/:crid
 * @apiName update chat room Info or settings
 *
 * @apiParam {string} crid chatRoomId
 *
 * @apiParam {string} ACTION -> DISAPPEARING_MESSAGES
 * @apiParam {string} disappearingMessages
 *
 * @apiParam {string} ACTION -> ADD_MEMBER
 * @apiParam {string} newMemberID
 *
 * @param res
 * @returns
 */

const updateChatRoomSettings = async (req: Request, res: Response) => {
  try {
    const { crid } = req.params;
    if (!crid) return httpStatus.badRequest(res, "chat room id is required");

    const chatRoomInfo = await Room.findById(crid);
    if (!chatRoomInfo) return httpStatus.notFound(res, "chat room Not Found");

    const { disappearingMessagesDuration } = req.body;

    console.log(
      "Disappearing messages duration : ",
      disappearingMessagesDuration
    );

    if (disappearingMessagesDuration !== chatRoomInfo.disappearingMessages) {
      let chatRoomSettingUpdatedMessage;

      switch (disappearingMessagesDuration) {
        case "24 hours":
          chatRoomInfo.disappearingMessages = "24h";
          chatRoomSettingUpdatedMessage = await Message.create({
            content: `${req.uid}: turned on disappearing messages. New messages will disappear from this chat ${disappearingMessagesDuration} after they're sent.`,
          });
          break;

        case "7 days":
          chatRoomInfo.disappearingMessages = "7d";
          chatRoomSettingUpdatedMessage = await Message.create({
            content: `${req.uid}: turned on disappearing messages. New messages will disappear from this chat ${disappearingMessagesDuration} after they're sent.`,
          });
          break;

        case "1 month":
          chatRoomInfo.disappearingMessages = "1m";
          chatRoomSettingUpdatedMessage = await Message.create({
            content: `${req.uid}: turned on disappearing messages. New messages will disappear from this chat ${disappearingMessagesDuration} after they're sent.`,
          });
          break;

        case "OFF":
          chatRoomInfo.disappearingMessages = "OFF";
          chatRoomSettingUpdatedMessage = await Message.create({
            content: `${req.uid}: turned off disappearing messages.`,
          });
          break;
      }

      console.log(chatRoomSettingUpdatedMessage);

      chatRoomInfo.messages.push(chatRoomSettingUpdatedMessage._id);
    }

    await chatRoomInfo.save();

    return httpStatus.success(
      res,
      chatRoomInfo,
      "ChatRoom info updated successfully"
    );
  } catch (error) {
    console.error(error);
    return httpStatus.internalServerError(res, "An error occured");
  }
};

export { getChatRoomDetails, updateChatRoomSettings };
