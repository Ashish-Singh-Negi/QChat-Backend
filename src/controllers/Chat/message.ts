import { query, Request, Response } from "express";

import httpStatus from "../../utils/response-codes";

import Message from "../../models/Message";
import Room from "../../models/Room";
import User from "../../models/User";
import mongoose from "mongoose";

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
  try {
    const { mid, newContent } = req.body;

    if (!mid || !newContent)
      return httpStatus.badRequest(res, "Update Message : Bad Request");

    console.log("MID : ", mid, "NEW Content : ", newContent);

    const message = await Message.findById(mid).select("__v").exec();
    if (!message) return httpStatus.notFound(res, "Message No longer exit");

    message.content = newContent;
    message.isEdited = true;

    await message.save();

    return httpStatus.success(res, { message }, "Message Updated");
  } catch (error) {
    console.log(error);
    return httpStatus.internalServerError(
      res,
      "update MESSAGE Internal Server Error"
    );
  }
};

const updatePinnedMessage = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { crid, mid } = req.params;

    console.log("CRID : ", crid, "MID : ", mid);

    if (!mid || !crid) {
      await session.abortTransaction();
      return httpStatus.badRequest(res, "Update Message : Bad Request");
    }

    const message = await Message.findById(mid).session(session);
    if (!message) {
      await session.abortTransaction();
      return httpStatus.notFound(res, "Message no longer exists");
    }

    const chatRoom = await Room.findById(crid).session(session);
    if (!chatRoom) {
      await session.abortTransaction();
      return httpStatus.notFound(res, "Chat room not found");
    }

    const isPinnedIndex = chatRoom.pinMessages.indexOf(mid);
    const pinMessagesCount = chatRoom.pinMessages.length;

    if (isPinnedIndex >= 0) {
      // Unpin
      chatRoom.pinMessages.splice(isPinnedIndex, 1);
      message.isPinned = false;
    } else {
      // Pin
      if (pinMessagesCount >= 3) {
        const pinMessageId = chatRoom.pinMessages.shift(); // Remove oldest

        const pinMessage = await Message.findById(pinMessageId).session(
          session
        );
        if (pinMessage) {
          pinMessage.isPinned = false;
          await pinMessage.save({ session });
        }
      }

      chatRoom.pinMessages.push(mid);
      message.isPinned = true;
    }

    await chatRoom.save({ session });
    await message.save({ session });

    await session.commitTransaction();
    session.endSession();

    return httpStatus.success(res, { message }, "Message Updated");
  } catch (error) {
    console.error("Error in pin/unpin message:", error);
    await session.abortTransaction();
    session.endSession();
    return httpStatus.internalServerError(
      res,
      "Update Message Internal Server Error"
    );
  }
};

const updateStarMessage = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { mid } = req.params;
    const { uid } = req.body;

    console.log(uid, mid);

    if (!uid || !mid) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(res, "User ID and Message ID are required");
    }

    // Fetch message and user within the session
    const message = await Message.findById(mid).session(session);
    if (!message) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.notFound(res, "Message not found");
    }

    const user = await User.findById(uid).select("-password").session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.notFound(res, "User not found");
    }

    if (message.isStar) {
      console.log("Unstarring message");
      message.isStar = false;

      const index = user.starMessages.indexOf(mid);
      if (index !== -1) {
        user.starMessages.splice(index, 1);
      }
    } else {
      console.log("Starring message");
      message.isStar = true;

      if (!user.starMessages.includes(mid)) {
        user.starMessages.push(mid);
      }
    }

    await user.save({ session });
    await message.save({ session });

    await session.commitTransaction();
    session.endSession();

    return httpStatus.success(
      res,
      { message, user },
      "Message starred/unstarred successfully"
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Star toggle error:", error);
    return httpStatus.internalServerError(res, "Star toggle failed");
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
  updatePinnedMessage,
  updateStarMessage,
  deleteMessageForEveryone,
  deleteMessageForMe,
  deleteChatMessages,
};
