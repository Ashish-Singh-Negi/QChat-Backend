import { query, Request, Response } from "express";

import httpStatus from "../../utils/response-codes";

import Message from "../../models/Message";
import Room from "../../models/Room";
import User from "../../models/User";

const getMessages = async (req: Request, res: Response) => {
  try {
    const { crid } = req.params;
    console.log("CRID:", crid);

    if (!crid) {
      return httpStatus.badRequest(
        res,
        "Chat Room ID is required to fetch messages."
      );
    }

    const messages = await Room.findById(crid)
      .select(`messages`)
      .populate("messages");

    console.log("Filtered:", messages);

    return httpStatus.success(
      res,
      messages,
      "Messages retrieved successfully."
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return httpStatus.internalServerError(
      res,
      "An unexpected error occurred while retrieving messages. Please try again later."
    );
  }
};

const getMessage = async (req: Request, res: Response) => {
  try {
    const { mid } = req.params;

    console.log("MID:", mid);

    if (!mid) {
      return httpStatus.badRequest(
        res,
        "Message ID is required to fetch the message."
      );
    }

    // Retrieve the message by its ID
    const message = await Message.findById(mid);

    if (!message) {
      return httpStatus.notFound(res, "No message found for the given ID.");
    }

    // Respond with the retrieved message
    return httpStatus.success(res, message, "Message retrieved successfully.");
  } catch (error) {
    console.error("Error fetching message:", error);
    return httpStatus.internalServerError(
      res,
      "An unexpected error occurred while retrieving the message. Please try again later."
    );
  }
};

const sendMessage = async (req: Request, res: Response) => {
  try {
    const { _id, content, sender, receiver, room } = req.body;

    console.log("Message ID:", _id);

    const message = content.trim();

    if (!message) {
      return httpStatus.badRequest(res, "Message content cannot be empty.");
    }

    console.log("Message:", message);
    console.log("Sent to:", receiver);
    console.log("Sent by:", sender);

    // Create the message entry in the database
    const messageDetails = await Message.create({
      _id,
      senderId: sender,
      receiverId: receiver,
      content: message,
    });

    // Find the chat room and associate the message with it
    const chatRoom = await Room.findById(room).exec();

    if (!chatRoom) {
      return httpStatus.notFound(res, "Chat room not found.");
    }

    chatRoom.messages.push(messageDetails._id);
    await chatRoom.save();

    return httpStatus.success(res, { message }, "Message sent successfully.");
  } catch (error) {
    console.error("Error sending message:", error);
    return httpStatus.internalServerError(
      res,
      "An unexpected error occurred while sending the message. Please try again later."
    );
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

          const pinMessage = await Message.findById(pinMessageId);

          if (pinMessage) {
            pinMessage.isPinned = false;
            pinMessage.save();
          }

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
        const { uid, mid } = req.body;

        const message = await Message.findById(mid).exec();
        const isStar = message.isStar;

        const user = await User.findById(uid).select("-password").exec();

        if (isStar) {
          console.log("Remove star message");
          message.isStar = false;

          const index = user.starMessages.indexOf(mid);
          user.starMessages.splice(index, 1);
        } else {
          console.log("Add star message");
          message.isStar = true;
          user.starMessages.push(mid);
        }

        await user.save();
        await message.save();

        return httpStatus.success(res, { message, user }, "Message Stared");
      } catch (error) {
        console.log(error);
        return httpStatus.internalServerError(
          res,
          "Star Internal Server Error"
        );
      }
      break;

    default: return httpStatus.badRequest(res, `Invalid ACTION`)
      break;
  }
};

const deleteChatMessages = async (req: Request, res: Response) => {
  try {
    const { crid } = req.params;
    const { action, duration } = req.query;

    console.log(duration);
    console.log(req.query);

    if (!crid)
      return httpStatus.badRequest(res, "DELETE Chat Message : Bad Request");

    /**
     *  DISAPPEAR_MESSAGES
     *  delete those messages & referances of messages from chat room,
     *  who has exceeded the duration of disapperingMessages duration set by users
     *
     */

    if (action === "DISAPPEAR_MESSAGES") {
      const chatRoom = await Room.findById(crid).populate("messages");

      console.log(chatRoom);

      const messages = chatRoom.messages;
      const currentTime = new Date().getTime();
      let messagesToDisappearAre = [];

      // time constants in milliseconds
      const ONE_DAY_IN_MILLI_SECONDS = 1000 * 60 * 60 * 24;
      const SEVEN_DAY_IN_MILLI_SECONDS = 1000 * 60 * 60 * 24 * 7;
      const ONE_MONTH_IN_MILLI_SECONDS = 1000 * 60 * 60 * 24 * 30;

      let durationInMS;

      if (duration === "24h") {
        durationInMS = ONE_DAY_IN_MILLI_SECONDS;
      } else if (duration === "7d") {
        durationInMS = SEVEN_DAY_IN_MILLI_SECONDS;
      } else if (duration === "1m") {
        durationInMS = ONE_MONTH_IN_MILLI_SECONDS;
      }

      for (let i = 0; i < messages.length; i++) {
        console.log(messages[i].createdAt);

        const messageTime = new Date(messages[i].createdAt).getTime();
        const messageCreatedTimeInMS = currentTime - messageTime;

        console.log(
          currentTime,
          " - ",
          messageTime,
          " = ",
          messageCreatedTimeInMS,
          ONE_DAY_IN_MILLI_SECONDS
        );

        if (messageCreatedTimeInMS > durationInMS!) {
          messagesToDisappearAre.push(messages[i]._id);
          messages.splice(i, 1);
        }
      }

      console.log("Disapper messages Are : ", messagesToDisappearAre);

      await Message.deleteMany({
        _id: {
          $in: messagesToDisappearAre,
        },
      });

      await chatRoom.save();

      return httpStatus.noContent(res);
    }

    const room = await Room.findById(crid).exec();
    const messageIDs = room.messages;

    // Delete all messages
    await Message.deleteMany({
      _id: {
        $in: messageIDs,
      },
    });

    room.messages = [];

    await room.save();

    return httpStatus.noContent(res);
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
    const { mid } = req.params;

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
    const { mid } = req.params;

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
  getMessage,
  sendMessage,
  updateMessage,
  deleteMessageForEveryone,
  deleteMessageForMe,
  deleteChatMessages,
};
