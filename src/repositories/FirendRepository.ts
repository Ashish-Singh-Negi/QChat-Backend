import { ClientSession } from "mongoose";
import User from "../models/User";
import BaseRepository from "./BaseRepository";

export default class FriendRepository extends BaseRepository<typeof User> {
  constructor(private userModel: typeof User) {
    super(userModel);
  }

  findfriendById(id: string, filter?: string, session?: ClientSession) {
    return session
      ? this.userModel
          .findById(id)
          .select(`-password -__v ${filter}`)
          .session(session)
      : this.userModel.findById(id).select(`-password -__v ${filter}`).lean();
  }

  findByUsername(
    username: string,
    filter = "-password -__v",
    session?: ClientSession
  ) {
    return session
      ? this.userModel
          .findOne({ username: username })
          .select(`${filter}`)
          .session(session)
      : this.userModel
          .findOne({ username: username })
          .select(`${filter}`)
          .lean();
  }
}
