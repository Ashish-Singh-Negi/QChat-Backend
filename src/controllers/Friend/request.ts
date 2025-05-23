import { Request, Response } from "express";
import httpStatus from "../../utils/response-codes";
import User from "../../models/User";
import Room from "../../models/Room";
import mongoose, { Types } from "mongoose";
import Message from "../../models/Message";
import FriendRequest from "../../models/FriendRequest";

const getFriendRequest = async (req: Request, res: Response) => {
  try {
    // rid ==> request id (friend)
    const { rid } = req.params;

    console.log("RID : ", rid);

    if (!rid) return httpStatus.badRequest(res, "Request Id is required");

    const request = await FriendRequest.findById(rid).lean();

    return httpStatus.success(res, request, "successed");
  } catch (error) {
    console.error(error);
    return httpStatus.internalServerError(
      res,
      "Failed to fetch friend request."
    );
  }
};

const sendFriendRequest = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { friendUsername } = req.body;
    const senderId = req.uid;

    console.log("UID:", senderId);
    console.log("Friend Username:", friendUsername);

    if (!friendUsername) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(res, "Friend username is required.");
    }

    const sender = await User.findById(senderId)
      .select("-password")
      .session(session);
    if (!sender) {
      return httpStatus.forbidden(res, "Unauthorized request.");
    }

    if (sender.username === friendUsername) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(
        res,
        "You cannot send a friend request to yourself."
      );
    }

    const recipient = await User.findOne({ username: friendUsername })
      .select("-password")
      .session(session);
    if (!recipient) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(res, `User '${friendUsername}' not found.`);
    }

    const isAlreadyfriend = sender.friendList.some(
      (fid: Types.ObjectId) => fid.toString() === recipient._id.toString()
    );
    if (isAlreadyfriend) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(res, `${friendUsername} is already friend`);
    }

    // Prevent duplicate friend request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        {
          "sender.username": sender.username,
          "recipient.username": recipient.username,
        },
        {
          "sender.username": recipient.username,
          "recipient.username": sender.username,
        },
      ],
    }).session(session);

    console.log("Existing request : ", existingRequest);

    if (existingRequest) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(
        res,
        "Friend request has already been sent."
      );
    }

    // Create friend request
    const friendRequest = new FriendRequest({
      sender: {
        username: sender.username,
        profilePic: sender.profilePic,
      },
      recipient: {
        username: recipient.username,
        profilePic: recipient.profilePic,
      },
    });

    await friendRequest.save({ session });

    sender.friendRequestList = sender.friendRequestList || [];
    recipient.friendRequestList = recipient.friendRequestList || [];

    sender.friendRequestList.push(friendRequest._id);
    recipient.friendRequestList.push(friendRequest._id);

    await sender.save({ session });
    await recipient.save({ session });

    await session.commitTransaction();
    session.endSession();

    return httpStatus.success(
      res,
      { from: sender, to: recipient },
      "Friend request sent successfully."
    );
  } catch (error) {
    console.error("Error sending friend request:", error);
    await session.abortTransaction();
    session.endSession();
    return httpStatus.internalServerError(
      res,
      "Failed to send friend request."
    );
  }
};

const acceptFriendRequest = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { rid } = req.params;
    if (!rid) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(res, "Request ID is required.");
    }

    const request = await FriendRequest.findById(rid).session(session);
    if (!request) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(res, "Invalid request ID.");
    }

    const senderUsername = request.sender.username;
    const recipientUsername = request.recipient.username;

    const sender = await User.findOne({ username: senderUsername }).session(
      session
    );
    const recipient = await User.findOne({
      username: recipientUsername,
    }).session(session);

    if (!sender || !recipient) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(res, "User data not found.");
    }

    // Ensure arrays exist
    sender.friendList = sender.friendList || [];
    recipient.friendList = recipient.friendList || [];
    sender.friendRequestList = sender.friendRequestList || [];
    recipient.friendRequestList = recipient.friendRequestList || [];

    // Add each user to the other's friend list
    sender.friendList.push(recipient._id);
    recipient.friendList.push(sender._id);

    // Remove friend request
    const senderFriendRequestIndex = sender.friendRequestList.indexOf(rid);
    if (senderFriendRequestIndex !== -1) {
      sender.friendRequestList.splice(senderFriendRequestIndex, 1);
    }

    const recipientFriendRequestIndex =
      recipient.friendRequestList.indexOf(rid);
    if (recipientFriendRequestIndex !== -1) {
      recipient.friendRequestList.splice(recipientFriendRequestIndex, 1);
    }

    request.status = "accepted";

    await request.deleteOne({ session });
    await sender.save({ session });
    await recipient.save({ session });

    await session.commitTransaction();
    session.endSession();

    return httpStatus.success(
      res,
      { request },
      "Friend request accepted successfully."
    );
  } catch (error) {
    console.error("Error while accepting friend request:", error);
    await session.abortTransaction();
    session.endSession();
    return httpStatus.internalServerError(
      res,
      "An error occurred while accepting the friend request."
    );
  }
};

const rejectFriendRequest = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { rid } = req.params;
    if (!rid) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(res, "Request ID is required.");
    }

    // Update friend request status and fetch request details in a single step
    const request = await FriendRequest.findById(rid).session(session).exec();
    if (!request) {
      await session.abortTransaction();
      session.endSession();
      return httpStatus.badRequest(res, "Invalid Request ID.");
    }

    request.status = "rejected";

    const senderUsername = request.sender.username;
    const recipientUsername = request.recipient.usernmae;

    // Remove request ID from both users' friend request lists
    await User.updateMany(
      { username: { $in: [senderUsername, recipientUsername] } },
      { $pull: { friendRequestList: rid } }
    ).session(session);

    // Delete the friend request
    await request.deleteOne([session]);

    await session.commitTransaction();
    session.endSession();

    return httpStatus.success(
      res,
      request,
      `Rejected ${senderUsername} request.`
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error rejecting friend request:", error);
    return httpStatus.internalServerError(
      res,
      "An error occurred while rejecting the friend request."
    );
  }
};

export {
  getFriendRequest,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
};
