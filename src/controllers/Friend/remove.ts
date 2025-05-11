import { Request, Response } from "express";
import httpStatus from "../../utils/response-codes";
import User from "../../models/User";
import Room from "../../models/Room";
import { Types } from "mongoose";
import Message from "../../models/Message";

const removeFriend = async (req: Request, res: Response) => {
  try {
    const { fid } = req.params;
    const uid = req.uid;

    if (!fid) return httpStatus.badRequest(res, "Invalid Friend ID");

    // Retrieve user and exclude password
    const user = await User.findById(uid).select("-password");
    console.log("User:", user);

    // Locate friend in user's contact list
    const contactIndex = user.contactList.findIndex(
      (friend: { contactId: Types.ObjectId }) =>
        friend.contactId.toString() === fid
    );

    if (contactIndex === -1)
      return httpStatus.notFound(res, "contact already removed");

    const friendIndex = user.friendList.findIndex(
      (friend: Types.ObjectId) => friend.toString() === fid
    );

    if (friendIndex === -1)
      return httpStatus.notFound(res, "Friend already removed");

    // Extract roomId for future use
    const { roomId } = user.contactList[contactIndex];

    // Remove friend from the friend list & contact list
    user.friendList.splice(friendIndex, 1);
    user.contactList.splice(contactIndex, 1);

    await user.save(); // Save changes to user

    // Retrieve room details
    const room = await Room.findById(roomId);

    // Identify user in room participants
    const userIndex = room.participants.indexOf(uid);
    console.log("Participant Index:", userIndex);

    // Remove user from room participants
    if (userIndex > -1) room.participants.splice(userIndex, 1);

    if (room.participants.length > 0) {
      // Notify remaining participants in the room
      const roomMesssage = await Message.create({
        content: `${user.username} is no longer your friend. To start a conversation, send friend request.`,
      });

      room.messages.push(roomMesssage._id);

      await room.save(); // Save changes to room
    } else {
      // Delete room if empty
      await Room.findByIdAndDelete(roomId);
    }

    return httpStatus.success(res, { user, room }, "Friend Removed");
  } catch (error) {
    console.error("Error:", error);
    return httpStatus.internalServerError(res, "Failed to remove friend");
  }
};

export { removeFriend };
