import { Request, Response } from "express";

import httpStatus from "../utils/response-codes";
import expressAsyncHandler from "express-async-handler";

import ChatService from "../services/chat";

import Chat from "../models/Chat";
import User from "../models/User";
import Message from "../models/Message";

import ChatRepository from "../repositories/ChatRepository";
import UserRepository from "../repositories/UserRepository";
import MessageRepository from "../repositories/MessageRepository";

import MessageService from "../services/message";
import { validateObjectId } from "../utils/validators/mongoId.validator";

/**
 * GET : /chats/:crid
 * req-body {}
 */
const getChatDetails = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { crid } = req.params;
    const { filter } = req.query;

    validateObjectId(crid, "Chat Id");

    const chatServiceInstance = new ChatService(
      new ChatRepository(Chat),
      new UserRepository(User),
      new MessageRepository(Message)
    );

    const { chat } = await chatServiceInstance.getChat(crid, filter as string);

    return httpStatus.success(res, chat, "Chat Details fetched successfully");
  }
);

/**
 * POST : /chats
 * req-body {
 *  fid: "k21o21io1o29d012jsp"
 * }
 */
const createChat = expressAsyncHandler(async (req: Request, res: Response) => {
  const { fid } = req.body;
  validateObjectId(fid, "friend Id");

  const uid = req.uid;

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
 * PATCH : /chats/:crid
 * req-body {
 *   disappearingMessagesDuration: "24 hours" | "7 days" | "1 month" | "OFF"
 * }
 */
const updateChatDisappearingMessagesDurationSetting = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const uid = req.uid;
    const { disappearingMessagesDuration } = req.body;

    const { crid } = req.params;
    validateObjectId(crid, "Chat Id");

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

/**
 * DELETE : /chats/:crid/disappear
 * req-body {}
 */
const disappearChatMessages = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { crid } = req.params;
    validateObjectId(crid, "Chat Id");

    const chatServiceInstance = new ChatService(
      new ChatRepository(Chat),
      new UserRepository(User),
      new MessageRepository(Message)
    );

    await chatServiceInstance.disappearChatMessages(crid);

    res.status(202).json({
      success: true,
      message: "Disappear message request accepted",
    });
  }
);

/**
 *  GET : /chats/:crid/messages
 *  req-body {}
 *
 */
const getChatMessages = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { crid } = req.params;
    validateObjectId(crid, "Chat Id");

    const messageServiceInstance = new MessageService(
      new MessageRepository(Message),
      new ChatRepository(Chat)
    );
    const { messages } = await messageServiceInstance.getAllChatMessage(crid);

    if (!messages.length)
      httpStatus.success(res, messages, "No messages Found");

    return httpStatus.success(res, messages, "messages retrived successfully");
  }
);

/**
 * DELETE : /chats/:crid
 * req-body {}
 */
const clearChat = expressAsyncHandler(async (req: Request, res: Response) => {
  const { crid } = req.params;
  validateObjectId(crid, "Chat Id");

  const chatServiceInstance = new ChatService(
    new ChatRepository(Chat),
    new UserRepository(User),
    new MessageRepository(Message)
  );

  await chatServiceInstance.clearChat(crid);

  return httpStatus.noContent(res);
});

export {
  getChatMessages,
  getChatDetails,
  createChat,
  updateChatDisappearingMessagesDurationSetting,
  disappearChatMessages,
  clearChat,
};
