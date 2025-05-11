import { Request, Response } from "express";
import httpStatus from "../../utils/response-codes";
import User from "../../models/User";
import Room from "../../models/Room";
import { Types } from "mongoose";
import Message from "../../models/Message";

const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { friendUsername } = req.body;
    const senderId = req.uid;

    console.log("UID:", senderId);
    console.log("Friend Username:", friendUsername);

    // Validate input
    if (!friendUsername) {
      return httpStatus.badRequest(res, "Friend username is required.");
    }

    // Fetch sender details
    const sender = await User.findById(senderId).select("-password");
    if (!sender) {
      return httpStatus.forbidden(res, "Unauthorized request.");
    }

    // Prevent self-friend request
    if (sender.username === friendUsername) {
      return httpStatus.badRequest(
        res,
        "You cannot send a friend request to yourself."
      );
    }

    // Fetch recipient details
    const recipient = await User.findOne({ username: friendUsername }).select(
      "-password"
    );

    if (!recipient) {
      return httpStatus.badRequest(res, `User '${friendUsername}' not found.`);
    }

    // Check if friend request already exists
    if (recipient.friendRequestList.includes(senderId)) {
      return httpStatus.badRequest(
        res,
        "Friend request has already been sent."
      );
    }

    // Send friend request
    recipient.friendRequestList.push(senderId);
    await recipient.save();

    return httpStatus.success(
      res,
      { from: sender, to: recipient },
      "Friend request sent successfully."
    );
  } catch (error) {
    console.error("Error sending friend request:", error);
    return httpStatus.internalServerError(
      res,
      "Failed to send friend request."
    );
  }
};

const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const { fid } = req.params;
    const uid = req.uid;

    console.log("Accept Friend Request - UID:", uid, "FID:", fid);

    // Validate friend ID
    if (!fid) {
      return httpStatus.badRequest(res, "Friend ID is required.");
    }

    // Fetch user data
    const user = await User.findById(uid).select("-password");
    if (!user) {
      return httpStatus.forbidden(res, "Unauthorized request.");
    }

    // Check if the friend request exists
    const requestIndex = user.friendRequestList.indexOf(fid);
    if (requestIndex === -1) {
      return httpStatus.notFound(res, "No pending friend request found.");
    }

    // Fetch friend's data
    const friend = await User.findById(fid).select("-password");
    if (!friend) {
      return httpStatus.notFound(res, "Friend not found.");
    }

    // Remove the friend request from the list
    user.friendRequestList.splice(requestIndex, 1);

    console.log("friends Friendlist : ", friend.username, friend.contactList);

    const isRecentRoomExist: {
      roomId: Types.ObjectId;
    } =
      friend.contactList.find(
        (friend: { contactId: Types.ObjectId }) =>
          friend.contactId.toString() === uid
      )     

    if (isRecentRoomExist) {
      // search for existing room
      const chatRoom = await Room.findById(isRecentRoomExist.roomId);

      // update chat room participants
      chatRoom.participants.push(uid);

      const roomMessage = await Message.create({
        content: `${user.username} accepted friend request`,
      });

      chatRoom.messages.push(roomMessage._id);

      await chatRoom.save();

      // update user contactList
      user.contactList.push({
        contactId: fid,
        roomId: isRecentRoomExist.roomId,
      });

      user.friendList.push(fid);
    } else {
      // Create a chat room for both users
      const chatRoom = await Room.create({ participants: [uid, fid] });

      // Update both users' friend lists with chat room reference
      const newFriendEntry = { contactId: fid, roomId: chatRoom._id };
      user.contactList.push(newFriendEntry);
      user.friendList.push(fid);

      friend.contactList.push({ contactId: uid, roomId: chatRoom._id });
      friend.friendList.push(uid);
    }

    // Save updates
    await user.save();
    await friend.save();

    return httpStatus.success(
      res,
      { user },
      "Friend request accepted successfully."
    );
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return httpStatus.internalServerError(
      res,
      "An error occurred while accepting the friend request."
    );
  }
};

const rejectFriendRequest = async (req: Request, res: Response) => {
  try {
    const { fid } = req.params;
    const uid = req.uid;

    console.log("Reject Friend Request - UID:", uid, "FID:", fid);

    // Validate friend ID
    if (!fid) {
      return httpStatus.badRequest(res, "Friend ID is required.");
    }

    // Fetch user details
    const user = await User.findById(uid).select("-password").exec();
    if (!user) {
      return httpStatus.forbidden(res, "Unauthorized request.");
    }

    // Check if the friend request exists
    const requestIndex = user.friendRequestList.indexOf(fid);
    if (requestIndex === -1) {
      return httpStatus.notFound(res, "No pending friend request found.");
    }

    // Remove the friend request from the list
    user.friendRequestList.splice(requestIndex, 1);
    await user.save();

    return httpStatus.success(
      res,
      user,
      "Friend request rejected successfully."
    );
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    return httpStatus.internalServerError(
      res,
      "An error occurred while rejecting the friend request."
    );
  }
};

export { sendFriendRequest, acceptFriendRequest, rejectFriendRequest };
