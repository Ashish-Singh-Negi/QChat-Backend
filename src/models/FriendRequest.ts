import mongoose, { model, models, Schema } from "mongoose";

const FriendRequestSechema = new Schema({
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
  mongoose.model("FriendRequest", FriendRequestSechema, "friend_requests");

export default FriendRequest;
