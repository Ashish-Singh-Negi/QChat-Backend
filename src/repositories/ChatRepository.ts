import { ClientSession } from "mongoose";
import BaseRepository from "./BaseRepository";
import { IChat } from "../interfaces/IChat";
import Chat from "../models/Chat";

export default class ChatRepository extends BaseRepository<typeof Chat> {
  constructor(private chatModel: typeof Chat) {
    super(chatModel);
  }

  findChatById(crid: string, filter = "-__v", session?: ClientSession) {
    return session
      ? this.chatModel.findById(crid).select(`${filter}`).session(session)
      : this.chatModel.findById(crid).select(`${filter}`).populate("messages");
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
