import FriendRequest from "../models/FriendRequest";
import User from "../models/User";

import { IUser } from "../interfaces/IUser";

import NotFoundError from "../errors/NotFoundError";
import ConflictError from "../errors/ConflictError";
import FriendRequestRepository from "../repositories/FriendRequestRepository";
import UserRepository from "../repositories/UserRepository";
import mongoose, { ClientSession, ObjectId } from "mongoose";

export default class FriendRequestService {
  constructor(
    private friendRequestRepo: FriendRequestRepository,
    private userRepo: UserRepository
  ) {}

  public getFriendRequest(rid: string) {
    return this.friendRequestRepo.findRequestById(rid);
  }

  public async sendFriendRequest(username: string, friendUsername: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const senderRecord = await this.userRepo.findByUsername(
        username,
        "friends friendRequests username profilePic",
        session
      );
      if (!senderRecord)
        throw new NotFoundError({ message: "Sender not found" });

      const recipientRecord = await this.userRepo.findByUsername(
        friendUsername,
        "friends friendRequests username profilePic",
        session
      );
      if (!recipientRecord)
        throw new NotFoundError({ message: "Invalid username" });

      const isAlreadyfriend = senderRecord.friends.some(
        (fid: string) => fid.toString() === recipientRecord._id.toString()
      );
      if (isAlreadyfriend)
        throw new ConflictError({
          message: `${friendUsername} is already in friends`,
        });

      const sender = {
        username: senderRecord.username,
        profilePic: senderRecord.profilePic,
      };

      const recipient = {
        username: recipientRecord.username,
        profilePic: recipientRecord.profilePic,
      };

      const isFriendRequestExist =
        await this.friendRequestRepo.findOneBySenderAndRecipientUsername(
          sender.username,
          recipient.username
        );
      if (isFriendRequestExist)
        throw new ConflictError({ message: `friend request already send` });

      const friendRequestRecord = await this.friendRequestRepo.create(
        sender,
        recipient,
        session
      );

      // add to request to friend requests
      senderRecord.friendRequests.push(friendRequestRecord._id);
      recipientRecord.friendRequests.push(friendRequestRecord._id);

      await this.userRepo.save(senderRecord, session);
      await this.userRepo.save(recipientRecord, session);
      await this.friendRequestRepo.save(friendRequestRecord, session);

      await session.commitTransaction();
      return { sender, recipient };
    } catch (error) {
      await session.abortTransaction();
      console.error(error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  public async acceptFriendRequest(rid: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const friendRequest: any = await this.friendRequestRepo.findRequestById(
        rid,
        "",
        session
      );
      if (!friendRequest)
        throw new NotFoundError({ message: "Friend request not found" });

      const senderUsername = friendRequest.sender.username;
      const recipientUsername = friendRequest.recipient.username;

      const [senderRecord, recipientRecord] = await Promise.all([
        this.userRepo.findByUsername(
          senderUsername,
          "friends friendRequests username profilePic",
          session
        ),
        this.userRepo.findByUsername(
          recipientUsername,
          "friends friendRequests username profilePic",
          session
        ),
      ]);

      if (!senderRecord || !recipientRecord)
        throw new NotFoundError({ message: "not found" });

      // add user to friends
      this.addToFriends(senderRecord, recipientRecord, rid);

      friendRequest.status = "accepted";

      console.log(senderRecord);
      console.log(recipientRecord);

      await this.friendRequestRepo.deleteById(friendRequest._id, session);
      await this.userRepo.save(senderRecord, session);
      await this.userRepo.save(recipientRecord, session);

      await session.commitTransaction();

      return { friendRequest };
    } catch (error) {
      await session.abortTransaction();
      console.error(error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addToFriends(sender: IUser, recipient: IUser, rid: string) {
    sender.friends.push(recipient._id);
    recipient.friends.push(sender._id);

    sender.friendRequests = sender.friendRequests.filter(
      (requestId) => requestId.toString() !== rid
    );
    recipient.friendRequests = recipient.friendRequests.filter(
      (requestId) => requestId.toString() !== rid
    );
  }

  async rejectFriendRequest(rid: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const friendRequestRecord: any =
        await this.friendRequestRepo.findRequestById(rid, "", session);
      if (!friendRequestRecord)
        throw new NotFoundError({ message: "Friend request not found" });

      const senderUsername = friendRequestRecord.sender.username;
      const recipientUsername = friendRequestRecord.recipient.username;

      const senderRecord = await this.userRepo.findByUsername(
        senderUsername,
        "friendRequests username",
        session
      );
      if (!senderRecord)
        throw new NotFoundError({ message: "sender Not Found" });

      const recipientRecord = await this.userRepo.findByUsername(
        recipientUsername,
        "friendRequests username",
        session
      );
      if (!recipientRecord)
        throw new NotFoundError({ message: "recipient Not Found" });

      senderRecord.friendRequests = senderRecord.friendRequests.filter(
        (requestId: ObjectId) => requestId.toString() !== rid
      );
      recipientRecord.friendRequests = recipientRecord.friendRequests.filter(
        (requestId: ObjectId) => requestId.toString() !== rid
      );

      friendRequestRecord.status = "rejected";

      // Delete friend request
      await this.friendRequestRepo.deleteById(friendRequestRecord._id, session);
      await this.userRepo.save(senderRecord, session);
      await this.userRepo.save(recipientRecord, session);

      console.log(friendRequestRecord);

      await session.commitTransaction();
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
