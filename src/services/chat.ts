import mongoose from "mongoose";

import NotFoundError from "../errors/NotFoundError";
import ConflictError from "../errors/ConflictError";

import UserRepository from "../repositories/UserRepository";
import MessageRepository from "../repositories/MessageRepository";
import ChatRepository from "../repositories/ChatRepository";
import BadRequestError from "../errors/BadRequestError";

const disappearingMessagesDurations = {
  "24 hours": "24h",
  "7 days": "7d",
  "1 month": "1m",
  OFF: "OFF",
};

export default class ChatService {
  constructor(
    private chatRepo: ChatRepository,
    private userRepo: UserRepository,
    private messageRepo: MessageRepository
  ) {}

  async getChat(crid: string, filter?: string) {
    const chatRecord = await this.chatRepo.findChatById(crid, filter);
    if (!chatRecord)
      throw new NotFoundError({
        message: `chat with id ${crid} Not Found`,
      });

    return { chat: chatRecord };
  }

  async createChat(userId: string, friendId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const participants = [userId, friendId].sort();

      const isChatExist = await this.chatRepo.findOneByParticipants(
        participants
      );
      if (isChatExist)
        throw new ConflictError({ message: `Chat already exists` });

      const newChat = await this.chatRepo.createChat(
        {
          participants: participants,
        },
        session
      );
      console.log(newChat);

      const [userRecord, friendRecord] = await Promise.all([
        await this.userRepo.findUserById(userId, "chats username", session),
        await this.userRepo.findUserById(friendId, "chats username", session),
      ]);

      if (!userRecord)
        throw new NotFoundError({ message: "User Details Not Found" });
      if (!friendRecord)
        throw new NotFoundError({ message: "friend Details Not Found" });

      userRecord.chats.push({
        chatId: newChat._id,
        contactId: friendRecord._id,
        name: friendRecord.username,
      });
      friendRecord.chats.push({
        chatId: newChat._id,
        contactId: userRecord._id,
        name: userRecord.username,
      });

      await this.userRepo.save(userRecord, session);
      await this.userRepo.save(friendRecord, session);

      await session.commitTransaction();

      return { chat: newChat };
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async updateChatDisappearingMessagesDuration(
    crid: string,
    duration: "24 hours" | "7 days" | "1 month" | "OFF",
    userId: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const chatRecord = await this.chatRepo.findChatById(crid, "", session);
      if (!chatRecord) throw new NotFoundError({ message: "Chat Not Found" });

      const isParticipant = chatRecord.participants.includes(userId);
      if (!isParticipant)
        throw new BadRequestError({
          message: "Oops! unauthorized to update chat settings",
        });

      const messageContent =
        duration === "OFF"
          ? `${userId}: turned off disappearing messages.`
          : `${userId}: turned on disappearing messages. New messages will disappear from this chat ${duration} after they're sent.`;

      const message = await this.messageRepo.createMessage(
        {
          content: messageContent,
        },
        session
      );

      chatRecord.disappearingMessages = disappearingMessagesDurations[duration];
      chatRecord.messages.push(message[0]._id);

      await this.chatRepo.save(chatRecord, session);
      await this.messageRepo.save(message[0], session);

      await session.commitTransaction();

      return { chat: chatRecord };
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async disappearChatMessages(crid: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const chatRecord = await this.chatRepo.findChatById(
        crid,
        "messages disappearingMessages",
        session
      );
      if (!chatRecord) throw new NotFoundError({ message: "Chat Not Found" });

      const messages = chatRecord.messages;

      const duration = chatRecord.disappearingMessages;

      // time constants in milliseconds
      const ONE_DAY_IN_MILLI_SECONDS = 1000 * 60 * 60 * 24;
      const SEVEN_DAY_IN_MILLI_SECONDS = 1000 * 60 * 60 * 24 * 7;
      const ONE_MONTH_IN_MILLI_SECONDS = 1000 * 60 * 60 * 24 * 30;

      const currentTime = new Date().getTime();

      let messagesToDisappearAre = [];
      let disappearDurationInMS;

      if (duration === "24h") {
        disappearDurationInMS = ONE_DAY_IN_MILLI_SECONDS;
      } else if (duration === "7d") {
        disappearDurationInMS = SEVEN_DAY_IN_MILLI_SECONDS;
      } else if (duration === "1m") {
        disappearDurationInMS = ONE_MONTH_IN_MILLI_SECONDS;
      }

      for (let i = 0; i < messages.length; i++) {
        console.log(messages[i].createdAt);

        const messageCreatedTime = new Date(messages[i].createdAt).getTime();
        const messageCreatedTimeInMS = currentTime - messageCreatedTime;

        console.log(
          currentTime,
          " - ",
          messageCreatedTime,
          " = ",
          messageCreatedTimeInMS,
          ONE_DAY_IN_MILLI_SECONDS
        );

        if (messageCreatedTimeInMS > disappearDurationInMS!) {
          messagesToDisappearAre.push(messages[i]._id);
          messages.splice(i, 1);
        }
      }

      await this.messageRepo.deleteManyById(messagesToDisappearAre, session);
      await this.chatRepo.save(chatRecord, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error(error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async clearChat(crid: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const chatRecord = await this.chatRepo.findChatById(crid, "", session);
      if (!chatRecord) throw new NotFoundError({ message: "Chat Not Found" });

      const messages: string[] = chatRecord.messages;
      await this.messageRepo.deleteManyById(messages, session);
      chatRecord.messages = [];

      await this.chatRepo.save(chatRecord, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
