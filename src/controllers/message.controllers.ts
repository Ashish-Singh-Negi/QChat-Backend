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

/**
 * GET /api/v1/messages/:mid
 * req-body {}
 */
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

/**
 * POST /api/v1/messages
 * req-body {
 *  mid: 6844622f99cafca93832c7c0,
 *  content: "message content",
 *  senderId: 6844622f99cafca93832c77d,
 *  recipientId: 6844622f99cafca93832vs62,
 *  chatId: 6844622f99cafca93832c7f1
 * }
 */
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
      chatId,
      "SEND"
    );

    return httpStatus.success(res, storedMessage, "Message sent successfully.");
  }
);

/**
 * PATCH /api/v1/messages/:mid/edit
 * req-body {
 *  content: "new edited content"
 * }
 */
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

/**
 * PATCH /api/v1/messages/:mid/pin
 * req-body {
 *  crid : 6844622f99cafca93832c7c9
 * }
 */
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

/**
 * PATCH /api/v1/messages/:mid/deleteforeveryone
 * req-body {}
 */
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

/**
 * PATCH deleteforeveryone/:mid/deleteforme
 * req-body {}
 */
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
