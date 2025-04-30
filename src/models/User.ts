import mongoose, { models, Schema } from "mongoose";

const FriendListSchema = new Schema(
  {
    contactId: mongoose.Schema.Types.ObjectId,
    roomId: mongoose.Schema.Types.ObjectId,
  },
  {
    _id: false,
  }
);

const UserSchema = new Schema(
  {
    username: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    profilePic: {
      type: String,
      default: null,
    },
    about: {
      type: String,
      default: null,
    },
    starMessages: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "Message",
    },
    following: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "User",
    },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "User",
    },
    friendList: {
      type: [FriendListSchema],
      default: [],
      ref: "User",
    },
    friendRequestList: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "User",
    },
    favouritesContactList: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    blacklist: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "user",
    },
    // access_token: String,
    // refresh_token: String,
    // access_token_expiry: String,
    // refresh_token_expiry: String,
  },
  {
    timestamps: true,
  }
);

const User = models.User || mongoose.model("User", UserSchema, "users");

export default User;
