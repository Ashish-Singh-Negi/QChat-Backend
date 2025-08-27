import { ClientSession } from "mongoose";
import BaseRepository from "./BaseRepository";
import Chat from "../models/Chat";
import { IChat } from "../interfaces/IChat";

export default class ChatRepository extends BaseRepository<typeof Chat> {
  constructor(private chatModel: typeof Chat) {
    super(chatModel);
  }

  findChatMessagesById(crid: string, filter = "-__v") {
    const query = this.chatModel.findById(crid).select(filter);
    return query;
  }

  findChatById(crid: string, filter = "-__v", session?: ClientSession) {
    const query = this.chatModel.findById(crid).select(filter);

    if (session) {
      query.session(session);
    }

    return query;
  }

  findOneByParticipants(participants: string[]) {
    return this.chatModel.findOne({
      participants: {
        $all: participants,
      },
    });
  }

  createChat(data: Partial<IChat>, session: ClientSession) {
    return new this.chatModel({
      ...data,
    }).save({ session });
  }
}
