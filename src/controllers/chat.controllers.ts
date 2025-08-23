import { Request, Response } from "express";

import httpStatus from "../utils/response-codes";
import expressAsyncHandler from "express-async-handler";

import ChatService from "../services/chat.service";

import MessageService from "../services/message.service";
import { validateObjectId } from "../validators/mongoId.validator";

/**
 * GET : /chats/:crid
 * req-body {}
 */
const getChatDetails = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { crid } = req.params;
    const { filter } = req.query;

    validateObjectId(crid, "Chat Id");

    const chatServiceInstance = new ChatService();

    const { chat, pagination } = await chatServiceInstance.getChat(
      crid,
      filter as string
    );

    res.status(200).json({
      success: true,
      message: "Chat retrieved successfully",
      data: chat,
      pagination: pagination,
    });
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

  const chatServiceInstance = new ChatService();
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

    const chatServiceInstance = new ChatService();
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

    const chatServiceInstance = new ChatService();

    await chatServiceInstance.disappearChatMessages(crid);

    res.status(202).json({
      success: true,
      message: "Disappear message request accepted",
    });
  }
);

/**
 *  GET : /chats/:crid/messages?page=1
 *  req-body {}
 *
 */
const getChatMessages = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { crid } = req.params;
    const { page } = req.query;
    validateObjectId(crid, "Chat Id");
    console.log("-------------------------------------------------");
    console.log("🚀 ~ crid:", crid);
    console.log("🚀 ~ page:", page);
    console.log("-------------------------------------------------");

    const messageServiceInstance = new MessageService();
    const { messages, pagination } =
      await messageServiceInstance.getAllChatMessage(crid, Number(page));

    if (!messages.length)
      httpStatus.success(res, { messages, pagination }, "No messages Found");

    return httpStatus.success(
      res,
      { messages, pagination },
      "messages retrived successfully"
    );
  }
);

/**
 * DELETE : /chats/:crid
 * req-body {}
 */
const clearChat = expressAsyncHandler(async (req: Request, res: Response) => {
  const { crid } = req.params;
  validateObjectId(crid, "Chat Id");

  const chatServiceInstance = new ChatService();

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
