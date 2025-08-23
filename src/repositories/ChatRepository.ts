import { ClientSession } from "mongoose";
import BaseRepository from "./BaseRepository";
import Chat from "../models/Chat";
import { IChat } from "../interfaces/IChat";

export default class ChatRepository extends BaseRepository<typeof Chat> {
  constructor(private chatModel: typeof Chat) {
    super(chatModel);
  }

  async findChatMessagesById(crid: string, filter = "-__v") {
    const query = await this.chatModel.findById(crid).select(filter);
    return query;
  }

  async findChatById(
    crid: string,
    filter = "-__v",
    session?: ClientSession
  ) {
    const query = await this.chatModel.findById(crid).select(filter);

    if (session) {
      query.session(session);
    }

    return query;
  }

  async findOneByParticipants(participants: string[]) {
    return await this.chatModel.findOne({
      participants: {
        $all: participants,
      },
    });
  }

  async createChat(data: Partial<IChat>, session: ClientSession) {
    return await new this.chatModel({
      ...data,
    }).save({ session });
  }
}
