import { Request, Response } from "express";

import httpStatus from "../../utils/response-codes";

import Message from "../../models/Message";
import Room from "../../models/Room";

const getMessages = async (req: Request, res: Response) => {
  try {
    console.log(req.query);

    const chatRoomId = req.query.crid;

    // console.log(" ChatRoomID is : ", chatRoomId);

    if (!chatRoomId) return httpStatus.badRequest(res, "chatRoomId is Request");

    const chatRoom = await Room.findById(chatRoomId).populate("messages");

    if (!chatRoom) return httpStatus.notFound(res, "No chats exists");

    httpStatus.success(res, chatRoom.messages, "Success");
  } catch (error) {
    console.log(error);
    httpStatus.internalServerError(res, "GET Messages : Internal Server Error");
  }
};

const sendMessage = async (req: Request, res: Response) => {
  try {
    const { _id, content, sender, receiver, room } = req.body;

    console.log("messageId : ", _id);

    const message = content.trim();

    if (!message) {
      httpStatus.badRequest(res, "message is required");
    }

    console.log(" Message : ", message);
    console.log(" sendTo  : ", receiver);
    console.log(" sendBy  : ", sender);

    const messageDetails = await Message.create({
      _id: _id,
      senderId: sender,
      receiverId: receiver,
      content: message,
    });

    const chatRoom = await Room.findById(room).exec();

    chatRoom.messages.push(messageDetails._id);

    await chatRoom.save();

    httpStatus.success(
      res,
      {
        message: message,
      },
      "Sended Successfuly"
    );
  } catch (error) {
    console.error(error);
    httpStatus.internalServerError(res, "POST Message : Internal Server Error");
  }
};

const updateMessage = async (req: Request, res: Response) => {
  const { action } = req.body;

  switch (action) {
    case "EDIT":
      try {
        const { mid, newContent } = req.body;

        if (!mid || !newContent)
          return httpStatus.badRequest(res, "Update Message : Bad Request");

        console.log("MID : ", mid, "NEW Content : ", newContent);

        const message = await Message.findById(mid).select("-v").exec();

        if (!message) return httpStatus.notFound(res, "Message No longer exit");

        message.content = newContent;
        message.isEdited = true;

        message.save();

        httpStatus.success(res, { message }, "Message Updated");
      } catch (error) {
        console.log(error);
        httpStatus.internalServerError(
          res,
          "update MESSAGE Internal Server Error"
        );
      }
      break;

    case "PIN":
      try {
        const { mid, crid } = req.body;

        if (!mid || !crid)
          return httpStatus.badRequest(res, "Update Message : Bad Request");

        console.log("MID : ", mid);

        // Search for message
        const message = await Message.findById(mid).select("-v").exec();
        if (!message) return httpStatus.notFound(res, "Message No longer exit");

        // Search for ChatRoom
        const chatRoom = await Room.findById(crid).select("-v").exec();

        // Store pinned message count/length
        const pinMessagesCount = chatRoom.pinMessages.length;

        // Store pinned message index
        const isPinnedIndex = chatRoom.pinMessages.indexOf(mid);

        console.log("IS Pinned : ", isPinnedIndex);

        // if pinned message exist in pinMessages array
        // than remove it And set it false
        if (isPinnedIndex >= 0) {
          chatRoom.pinMessages.splice(isPinnedIndex, 1);
          message.isPinned = false;

          chatRoom.save();
          message.save();

          return httpStatus.success(res, { message }, "Message Updated");
        }

        if (pinMessagesCount < 3) {
          chatRoom.pinMessages.push(mid);
          message.isPinned = true;
        } else {
          const pinMessageId = chatRoom.pinMessages[0];

          const pinMessage = await Message.findById(pinMessageId).exec();

          pinMessage.isPinned = false;

          pinMessage.save();

          chatRoom.pinMessages.shift();
          chatRoom.pinMessages.push(mid);
          message.isPinned = true;
        }

        chatRoom.save();
        message.save();

        httpStatus.success(res, { message }, "Message Updated");
      } catch (error) {
        console.log(error);
        httpStatus.internalServerError(
          res,
          "update MESSAGE Internal Server Error"
        );
      }
      break;

    case "STAR":
      try {
        const { mid } = req.body;
      } catch (error) {
        console.log(error);
      }

    default:
      break;
  }
};

const deleteChatMessages = async (req: Request, res: Response) => {
  try {
    const { crid } = req.query;

    console.log("CRID  ", crid);

    if (!crid)
      return httpStatus.badRequest(res, "DELETE Chat Message : Bad Request");

    const room = await Room.findById(crid).exec();

    let messages = room.messages;

    await Message.deleteMany({
      _id: {
        $in: messages,
      },
    });

    room.messages = [];

    await room.save();

    httpStatus.noContent(res);
  } catch (error) {
    console.log(error);
    httpStatus.internalServerError(
      res,
      "delete Message Internal Server message"
    );
  }
};

const deleteMessageForEveryone = async (req: Request, res: Response) => {
  try {
    const { mid } = req.body;

    console.log("MID : ", mid);

    if (!mid) return httpStatus.badRequest(res, "DELETE Message : Bad Request");

    const message = await Message.findById(mid).exec();

    message.visibleToEveryone = false;

    await message.save();

    httpStatus.noContent(res);
  } catch (error) {
    console.log(error);
    httpStatus.internalServerError(
      res,
      "delete Message Internal Server message"
    );
  }
};

const deleteMessageForMe = async (req: Request, res: Response) => {
  try {
    const { mid } = req.body;

    console.log(mid);

    if (!mid)
      return httpStatus.badRequest(res, "DELETE Message for Me : Bad Request");

    const message = await Message.findById(mid).select("-v");

    message.visibleToSender = false;

    await message.save();

    httpStatus.noContent(res);
  } catch (error) {
    console.log(error);
    httpStatus.internalServerError(
      res,
      "delete Message Internal Server message"
    );
  }
};

export {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessageForEveryone,
  deleteMessageForMe,
  deleteChatMessages,
};
