import { Request, Response } from "express";
import mongoose from "mongoose";
import expressAsyncHandler from "express-async-handler";

import BadRequestError from "../../../errors/BadRequestError";

import httpStatus from "../../../utils/response-codes";

import User from "../../../models/User";
import Message from "../../../models/Message";
import Chat from "../../../models/Chat";

import UserRepository from "../../../repositories/UserRepository";
import MessageRepository from "../../../repositories/MessageRepository";
import ChatRepository from "../../../repositories/ChatRepository";

import ChatService from "../../../services/chat";

const getChatDetails = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { crid } = req.params;
    const { filter } = req.query;

    if (!crid) return httpStatus.badRequest(res, "chat room Id is required");

    const chatServiceInstance = new ChatService(
      new ChatRepository(Chat),
      new UserRepository(User),
      new MessageRepository(Message)
    );

    const { chat } = await chatServiceInstance.getChat(crid, filter as string);

    return httpStatus.success(
      res,
      chat,
      "Chat room Details fetched successfully"
    );
  }
);

const createChat = expressAsyncHandler(async (req: Request, res: Response) => {
  const { fid } = req.body;
  const uid = req.uid;

  // Validate input
  if (!fid) throw new BadRequestError({ message: "fid is required" });

  if (!mongoose.Types.ObjectId.isValid(fid.toString()))
    throw new BadRequestError({ message: "Invalid fid" });

  const chatServiceInstance = new ChatService(
    new ChatRepository(Chat),
    new UserRepository(User),
    new MessageRepository(Message)
  );
  const { chat } = await chatServiceInstance.createChat(
    uid as string,
    fid as string
  );

  return httpStatus.created(res, chat, "Chat Room Created");
});

/**
 * @api {PATCH} /users/chats/:crid
 * @apiName UpdateChatRoom
 * @apiGroup Chat
 * @apiDescription Updates chat room settings or adds a new member.
 *
 * @apiParam {String} crid Chat Room ID.
 * @apiParam {String} disappearingMessages Enables disappearing messages.
 *
 * @apiSuccess {String} message Success message.
 * @apiError {String} error Error message.
 */

const updateChatSettings = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const uid = req.uid;

    const { disappearingMessagesDuration } = req.body;
    const { crid } = req.params;
    if (!crid) throw new BadRequestError({ message: "chat room id required" });

    const chatServiceInstance = new ChatService(
      new ChatRepository(Chat),
      new UserRepository(User),
      new MessageRepository(Message)
    );
    const { chat } =
      await chatServiceInstance.updateChatDisappearingMessagesDuration(
        crid,
        disappearingMessagesDuration,
        uid!
      );

    return httpStatus.success(
      res,
      chat,
      "ChatRoom disappearing duration updated successfully"
    );
  }
);

const disappearChatMessages = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { crid } = req.params;
    if (!crid) throw new BadRequestError({ message: "chat id required" });

    const chatServiceInstance = new ChatService(
      new ChatRepository(Chat),
      new UserRepository(User),
      new MessageRepository(Message)
    );

    await chatServiceInstance.disappearChatMessages(crid);

    res.status(202).json({
      message: "Disappear message request accepted",
    });
  }
);

const deleteChat = expressAsyncHandler(async (req: Request, res: Response) => {
  const { crid } = req.params;
  if (!crid) {
    return httpStatus.badRequest(res, "Chat room ID is required.");
  }

  const chatServiceInstance = new ChatService(
    new ChatRepository(Chat),
    new UserRepository(User),
    new MessageRepository(Message)
  );

  await chatServiceInstance.deleteChat(crid);

  return httpStatus.noContent(res);
});

export {
  getChatDetails,
  createChat,
  updateChatSettings,
  disappearChatMessages,
  deleteChat,
};
