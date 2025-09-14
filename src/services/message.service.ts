import mongoose from "mongoose";
import NotFoundError from "../errors/NotFoundError";
import MessageRepository from "../repositories/MessageRepository";
import ChatRepository from "../repositories/ChatRepository";
import { getPaginationMeta } from "../utils/pagination";
import Message from "../models/Message";
import Chat from "../models/Chat";

type MessageStatus = "SEND" | "DELIVERED" | "SEEN";

export default class MessageService {
  private messageRepo = new MessageRepository(Message);
  private chatRepo = new ChatRepository(Chat);

  async getAllChatMessage(crid: string, page?: number, limit?: number) {
    console.log("🚀 ~ MessageService ~ getAllChatMessage ~ limit:", limit);
    console.log("🚀 ~ MessageService ~ getAllChatMessage ~ page:", page);

    const chatRecord = await this.chatRepo.findChatMessagesById(
      crid,
      "messages"
    );

    if (!chatRecord) {
      throw new NotFoundError({ message: "Chat Messages Not Found" });
    }

    const totalMessages = chatRecord.messages.length;

    if (!page || !limit) {
      const populated = await chatRecord.populate({
        path: "messages",
        options: {
          sort: { createdAt: -1 },
        },
      });

      return {
        messages: populated.messages,
      };
    }

    const { offset, pagination } = getPaginationMeta(
      page,
      limit,
      totalMessages
    );

    const populated = await chatRecord.populate({
      path: "messages",
      options: {
        limit,
        sort: { createdAt: -1 },
        skip: offset,
      },
    });

    return {
      messages: populated.messages,
      pagination,
    };
  }

  async getMessage(mid: string) {
    const message: any = await this.messageRepo.findById(mid, true);
    if (!message) throw new NotFoundError({ message: "Message Not Found" });

    return message;
  }

  async storeMessage(
    mid: any,
    senderId: string,
    recipientId: string,
    content: string,
    chatId: string,
    status: MessageStatus
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const newMessageRecord = await this.messageRepo.createMessage(
        {
          _id: mid,
          content,
          senderId,
          chatId,
          recipientId,
          status,
        },
        session
      );

      const chatRecord = await this.chatRepo.findChatById(
        chatId,
        "messages",
        session
      );
      if (!chatRecord) throw new NotFoundError({ message: "Chat Not Found" });

      chatRecord.messages.push(mid);

      await this.messageRepo.save(newMessageRecord[0], session);
      await this.chatRepo.save(chatRecord, session);

      await session.commitTransaction();

      return { storedMessage: newMessageRecord };
    } catch (error) {
      await session.abortTransaction();
      console.error(error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async updateMessageStatus(mid: string, status: MessageStatus) {
    const messageRecord = await this.messageRepo.findByIdAndUpdate(mid, {
      status: status,
    });

    if (!messageRecord)
      throw new NotFoundError({ message: "Update Failed: Message Not Found" });

    return messageRecord;
  }

  async editMessage(mid: string, newContent: string) {
    const messageRecord: any = await this.messageRepo.findById(mid, false);
    if (!messageRecord)
      throw new NotFoundError({ message: "Message Not Found" });

    messageRecord.content = newContent;
    messageRecord.isEdited = true;

    await this.messageRepo.save(messageRecord);

    return { editedMessage: messageRecord };
  }

  async pinMessage(crid: string, mid: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const chatRecord = await this.chatRepo.findChatById(
        crid,
        "pinMessages",
        session
      );
      console.log(chatRecord);
      if (!chatRecord) throw new NotFoundError({ message: "Chat Not Found" });

      const messageRecord = await this.messageRepo.findMessageById(
        mid,
        "",
        session
      );
      console.log(messageRecord);
      if (!messageRecord)
        throw new NotFoundError({ message: "Message Not Found" });

      const isPinned = chatRecord.pinMessages.indexOf(mid);
      const pinMessagesCount = chatRecord.pinMessages.length;

      if (isPinned > -1) {
        // Unpin
        chatRecord.pinMessages.splice(isPinned, 1);
        messageRecord.isPinned = false;
      } else {
        // Pin
        if (pinMessagesCount >= 3) {
          const pinMessageId = chatRecord.pinMessages.shift(); // Remove oldest

          const pinMessage = await this.messageRepo.findMessageById(
            pinMessageId,
            "",
            session
          );

          if (pinMessage) {
            pinMessage.isPinned = false;
            await this.messageRepo.save(pinMessage, session);
          }
        }

        chatRecord.pinMessages.push(mid);
        messageRecord.isPinned = true;
      }

      await this.messageRepo.save(messageRecord, session);
      await this.chatRepo.save(chatRecord, session);

      console.log(messageRecord);
      console.log(chatRecord);

      await session.commitTransaction();
      return {
        message: messageRecord,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error(error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async deleteMessageForEveryone(mid: string) {
    const messageRecord: any = await this.messageRepo.findById(mid, false);
    if (!messageRecord)
      throw new NotFoundError({ message: "Message Not Found" });

    messageRecord.visibleToEveryone = false;

    await this.messageRepo.save(messageRecord);

    return messageRecord;
  }

  async deleteMessageForMe(mid: string) {
    const messageRecord: any = await this.messageRepo.findById(mid, false);
    if (!messageRecord)
      throw new NotFoundError({ message: "Message Not Found" });

    messageRecord.visibleToSender = false;

    await this.messageRepo.save(messageRecord);

    return messageRecord;
  }
}
