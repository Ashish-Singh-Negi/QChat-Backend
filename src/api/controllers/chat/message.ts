import { Request, Response } from "express";

import httpStatus from "../../../utils/response-codes";
import Chat from "../../../models/Chat";
import Message from "../../../models/Message";

import expressAsyncHandler from "express-async-handler";
import BadRequestError from "../../../errors/BadRequestError";
import MessageService from "../../../services/message";

import MessageRepository from "../../../repositories/MessageRepository";
import ChatRepository from "../../../repositories/ChatRepository";

const getAllMessages = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { crid } = req.params;
    if (!crid) throw new BadRequestError({ message: "chat room id required" });

    const messageServiceInstance = new MessageService(
      new MessageRepository(Message),
      new ChatRepository(Chat)
    );
    const { messages } = await messageServiceInstance.getAllChatMessage(crid);

    return httpStatus.success(res, messages, "messages retrived successfully");
  }
);

const getMessage = expressAsyncHandler(async (req: Request, res: Response) => {
  const { mid } = req.params;
  if (!mid)
    throw new BadRequestError({
      message: "mid is required",
    });

  const messageServiceInstance = new MessageService(
    new MessageRepository(Message),
    new ChatRepository(Chat)
  );
  const message = await messageServiceInstance.getMessage(mid);

  return httpStatus.success(res, message, "message retrived successfully");
});

const storeMessage = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { mid, content, senderId, recipientId, chatId } = req.body;

    if (!content.trim()) {
      return httpStatus.badRequest(res, "Message content cannot be empty.");
    }

    console.log("Message content:", content);
    console.log("Sent to:", recipientId);
    console.log("Sent by:", senderId);

    const messageServiceInstance = new MessageService(
      new MessageRepository(Message),
      new ChatRepository(Chat)
    );
    const { createdMessage } = await messageServiceInstance.storeMessage(
      mid,
      senderId,
      recipientId,
      content.trim(),
      chatId
    );

    return httpStatus.success(
      res,
      createdMessage,
      "Message sent successfully."
    );
  }
);

const editMessage = expressAsyncHandler(async (req: Request, res: Response) => {
  const { mid, newContent } = req.body;

  if (!mid || !newContent)
    throw new BadRequestError({ message: "mid and new Content is required" });

  const messageServiceInstance = new MessageService(
    new MessageRepository(Message),
    new ChatRepository(Chat)
  );

  const { editedMessage } = await messageServiceInstance.editMessage(
    mid,
    newContent
  );

  return httpStatus.success(res, editedMessage, "Message Updated");
});

const updatePinMessage = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { crid, mid } = req.params;

    if (!mid || !crid) {
      return httpStatus.badRequest(res, "Update Message : Bad Request");
    }

    const messageServiceInstance = new MessageService(
      new MessageRepository(Message),
      new ChatRepository(Chat)
    );
    const { message } = await messageServiceInstance.pinMessage(crid, mid);

    return httpStatus.success(res, { message }, "Message Pinned");
  }
);

const deleteMessageForEveryone = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { mid } = req.params;
    if (!mid)
      return httpStatus.badRequest(
        res,
        "DELETE Message for Everyone : Bad Request"
      );

    const messageServiceInstance = new MessageService(
      new MessageRepository(Message),
      new ChatRepository(Chat)
    );
    await messageServiceInstance.deleteMessageForEveryone(mid);

    httpStatus.noContent(res);
  }
);

const deleteMessageForMe = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { mid } = req.params;
    if (!mid)
      return httpStatus.badRequest(res, "DELETE Message for Me : Bad Request");

    const messageServiceInstance = new MessageService(
      new MessageRepository(Message),
      new ChatRepository(Chat)
    );
    await messageServiceInstance.deleteMessageForEveryone(mid);

    httpStatus.noContent(res);
  }
);

export {
  getAllMessages,
  getMessage,
  storeMessage,
  editMessage,
  updatePinMessage,
  deleteMessageForEveryone,
  deleteMessageForMe,
};
