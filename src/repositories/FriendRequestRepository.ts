import { ClientSession } from "mongoose";
import FriendRequest from "../models/FriendRequest";
import BaseRepository from "./BaseRepository";

export default class FriendRequestRepository extends BaseRepository<
  typeof FriendRequest
> {
  constructor(private friendRequestModel: typeof FriendRequest) {
    super(friendRequestModel);
  }

  create(
    sender: { username: string; profilePic: string },
    recipient: {
      username: string;
      profilePic: string;
    },
    session: ClientSession
  ) {
    return new this.friendRequestModel({
      sender: sender,
      recipient: recipient,
    }).save({ session });
  }

  findRequestById(fid: string, filter = "-__v", session?: ClientSession) {
    return session
      ? this.friendRequestModel
          .findById(fid)
          .select(`${filter}`)
          .session(session)
      : this.friendRequestModel.findById(fid).select(`${filter}`).lean();
  }

  findOneBySenderAndRecipientUsername(
    senderUsername: string,
    recipientUsername: string
  ) {
    return this.friendRequestModel.findOne({
      $or: [
        {
          "sender.username": senderUsername,
          "recipient.username": recipientUsername,
        },
        {
          "sender.username": recipientUsername,
          "recipient.username": senderUsername,
        },
      ],
    });
  }
}
