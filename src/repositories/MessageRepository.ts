import { ClientSession, HydratedDocument } from "mongoose";
import Message from "../models/Message";
import BaseRepository from "./BaseRepository";
import { IMessage } from "../interfaces/IMessage";

export default class MessageRepository extends BaseRepository<typeof Message> {
  constructor(private messageModel: typeof Message) {
    super(messageModel);
  }

  findMessageById(mid: string, filter = "-__v", session?: ClientSession) {
    return session
      ? this.messageModel.findById(mid).select(`${filter}`).session(session)
      : this.messageModel.findById(mid).select(`${filter}`).lean();
  }

  createMessage(context: Partial<IMessage>, session?: ClientSession) {
    return this.messageModel.create(
      [
        {
          ...context,
        },
      ],
      { session }
    );
  }

  deleteManyById(messages: string[], session: ClientSession) {
    return this.messageModel
      .deleteMany({ _id: { $in: messages } })
      .session(session);
  }
}
