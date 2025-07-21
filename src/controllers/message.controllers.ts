import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";

import httpStatus from "../utils/response-codes";

import BadRequestError from "../errors/BadRequestError";

import MessageService from "../services/message";

import MessageRepository from "../repositories/MessageRepository";
import ChatRepository from "../repositories/ChatRepository";

import Message from "../models/Message";
import Chat from "../models/Chat";
import { validateObjectId } from "../utils/validators/mongoId.validator";

const getMessage = expressAsyncHandler(async (req: Request, res: Response) => {
  const { mid } = req.params;
  validateObjectId(mid, "message Id");

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

    console.log("Message content:", content);
    console.log("Sent to:", recipientId);
    console.log("Sent by:", senderId);

    const messageServiceInstance = new MessageService(
      new MessageRepository(Message),
      new ChatRepository(Chat)
    );
    const { storedMessage } = await messageServiceInstance.storeMessage(
      mid,
      senderId,
      recipientId,
      content.trim(),
      chatId
    );

    return httpStatus.success(res, storedMessage, "Message sent successfully.");
  }
);

const editMessage = expressAsyncHandler(async (req: Request, res: Response) => {
  const { mid } = req.params;
  validateObjectId(mid, "message Id");
  const { content } = req.body;

  const messageServiceInstance = new MessageService(
    new MessageRepository(Message),
    new ChatRepository(Chat)
  );

  const { editedMessage } = await messageServiceInstance.editMessage(
    mid,
    content
  );

  return httpStatus.success(res, editedMessage, "Message Updated");
});

const updatePinMessage = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { mid } = req.params;
    const { crid } = req.body;

    // ------------------ validation START--------------------------
    if (!crid) {
      throw new BadRequestError({
        message: "chat id are required",
      });
    }

    validateObjectId(mid, "message Id");
    validateObjectId(crid, "chat Id");
    // ------------------ validation END-----------------------------

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
    validateObjectId(mid, "message Id");

    const messageServiceInstance = new MessageService(
      new MessageRepository(Message),
      new ChatRepository(Chat)
    );
    await messageServiceInstance.deleteMessageForEveryone(mid);

    return httpStatus.noContent(res);
  }
);

const deleteMessageForMe = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { mid } = req.params;
    validateObjectId(mid, "message Id");

    const messageServiceInstance = new MessageService(
      new MessageRepository(Message),
      new ChatRepository(Chat)
    );
    await messageServiceInstance.deleteMessageForMe(mid);

    return httpStatus.noContent(res);
  }
);

export {
  getMessage,
  storeMessage,
  editMessage,
  updatePinMessage,
  deleteMessageForEveryone,
  deleteMessageForMe,
};
