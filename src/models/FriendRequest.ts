import mongoose, { model, models, Schema } from "mongoose";

interface IFriendRequest extends Document {
  sender: {
    username: string;
    profilePic: string;
  };
  recipient: {
    username: string;
    profilePic: string;
  };
  status: "pending" | "accepted" | "declined";
  sendAt: Date;
  respondedAt?: Date;
}

const FriendRequestSechema = new Schema<IFriendRequest>({
  sender: {
    type: {
      username: String,
      profilePic: String,
    },
    _id: false,
    require: true,
  },
  recipient: {
    type: {
      username: String,
      profilePic: String,
    },
    _id: false,
    require: true,
  },
  status: {
    type: String,
    enum: ["accepted", "pending", "rejected"],
    default: "pending",
  },
  sendAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
  },
});

const FriendRequest =
  models.FriendRequest ||
  mongoose.model<IFriendRequest>(
    "FriendRequest",
    FriendRequestSechema,
    "friend_requests"
  );

export default FriendRequest;
