import { Request, Response } from "express";
import httpStatus from "../../utils/response-codes";
import Room from "../../models/Room";
import Message from "../../models/Message";
import mongoose from "mongoose";
import User from "../../models/User";

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

const createChatRoom = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fid } = req.body;
    const uid = req.uid;

    // Validate input
    if (!fid) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(res, "Friend ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(fid.toString())) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(res, "Invalid friend ID");
    }

    const participants = [uid, fid].sort(); // Ensure consistent ordering

    // Check for existing chat room
    const existingRoom = await Room.findOne({
      participants: { $all: participants },
    });
    if (existingRoom) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.conflict(res, "Chat Room already exists");
    }

    // Create room
    const [chatRoom] = await Room.create([{ participants }], { session });

    // Update contactRoomList for both users
    await User.findByIdAndUpdate(
      uid,
      { $push: { contactRoomList: chatRoom._id } },
      { session }
    );
    await User.findByIdAndUpdate(
      fid,
      { $push: { contactRoomList: chatRoom._id } },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return httpStatus.created(res, chatRoom, "Chat Room Created");
  } catch (error) {
    await session.abortTransaction(); // Important: rollback
    session.endSession();

    console.error("Create Chat Room Error:", error);
    return httpStatus.internalServerError(
      res,
      "Create chat room Internal Server Error"
    );
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

const deleteChatRoom = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { crid } = req.params;
    if (!crid) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(res, "Chat room ID is required.");
    }

    // Fetch chat room inside the transaction
    const chatRoom = await Room.findById(crid).session(session);
    if (!chatRoom) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(res, "Invalid chat room ID.");
    }

    // Delete all messages related to this chat room
    await Message.deleteMany({ _id: { $in: chatRoom.messages } }).session(
      session
    );

    await User.updateMany(
      { _id: { $in: chatRoom.participants } },
      { $pull: { contactRoomList: crid } }
    ).session(session);

    // Delete the chat room itself
    await chatRoom.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return httpStatus.noContent(res);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Delete Chat Room Error:", error);
    return httpStatus.internalServerError(
      res,
      "An error occurred while deleting the chat room."
    );
  }
};

export {
  getChatRoomDetails,
  createChatRoom,
  updateChatRoomSettings,
  deleteChatRoom,
};
