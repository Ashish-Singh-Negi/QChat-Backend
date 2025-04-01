import { Request, Response } from "express";
import httpStatus from "../../utils/response-codes";
import User from "../../models/User";
import Room from "../../models/Room";

const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { friendusername } = req.body;

    const uid = req.uid;

    console.log(" UID : ", uid);
    console.log(" f username : ", friendusername);

    if (!friendusername)
      return httpStatus.badRequest(res, "Required friend username");

    const user = await User.findById(uid).select("-password");

    if (!user) return httpStatus.forbidden(res, "unauthorized");

    if (user.username === friendusername)
      return httpStatus.badRequest(res, "Bad request");

    const friend = await User.findOne({ username: friendusername }).select(
      "-password"
    );

    if (!friend)
      return httpStatus.badRequest(res, `${friendusername} not found`);

    const isRequestExist = friend.friendRequestList.find(
      (id: string) => id === uid
    );

    console.log(isRequestExist);

    if (isRequestExist)
      return httpStatus.badRequest(res, "Request already send");

    friend.friendRequestList.push(uid);

    friend.save();

    return httpStatus.success(res, { FROM: user, TO: friend }, "Request Send");
  } catch (error) {
    console.error(error);
    return httpStatus.internalServerError(res, "Friend Request Failed");
  }
};

const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const { fid } = req.body;

    const uid = req.uid;

    console.log("UID : ", uid);
    console.log("FID : ", fid);

    if (!fid) return httpStatus.badRequest(res, "Invalid FID");

    const user = await User.findById(uid).select("-password");

    // check if friend request exist
    const index = user.friendRequestList.indexOf(fid);

    if (index === -1)
      return httpStatus.notFound(res, "No Friend request found");

    // search for request having FID
    const friend = await User.findById(fid).select("-password");

    // accept the request
    user.friendRequestList.splice(index, 1);

    const chatRoom = await Room.create({
      participants: [uid, fid],
    });

    // add to friends list
    user.friendList.push({
      contactId: fid,
      roomId: chatRoom._id,
    });

    friend.friendList.push({
      contactId: uid,
      roomId: chatRoom._id,
    });

    user.save();
    friend.save();

    return httpStatus.success(res, { user, chatRoom }, "Request Accepted");
  } catch (error) {
    return httpStatus.internalServerError(res, "Internal Server Error");
  }
};

const rejectfriendRequest = async (req: Request, res: Response) => {
  try {
    const { fid } = req.body;

    const uid = req.uid;

    if (!fid) return httpStatus.badRequest(res, "Invalid FID");

    const user = await User.findById(uid).select("-password").exec();

    // check if friend request exist
    const index = user.friendRequestList.indexOf(fid);

    if (index === -1)
      return httpStatus.notFound(res, "No Friend request found");

    // reject the request
    user.friendRequestList.splice(index, 1);

    await user.save();

    return httpStatus.success(res, user, "Rejected Successfully");
  } catch (error) {
    console.error(error);
    return httpStatus.internalServerError(res, "Reject friend request Failed");
  }
};

export { sendFriendRequest, acceptFriendRequest, rejectfriendRequest };
