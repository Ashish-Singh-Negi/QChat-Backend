import mongoose, { models, Schema } from "mongoose";

// const ContactListSchema = new Schema(
//   {
//     contactId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     roomId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Room",
//     },
//   },
//   {
//     _id: false,
//   }
// );

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
    isOnline: {
      type: Boolean,
      default: false,
    },
    isChatAllowForStrangers: {
      type: Boolean,
      default: false,
    },
    chats: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "Room",
    },
    friends: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "User",
    },
    friendRequests: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "FriendRequest",
    },
    // starMessages: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   default: [],
    //   ref: "Message",
    // },
    // favouritesContactList: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   default: [],
    // },
    // blacklist: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   default: [],
    //   ref: "user",
    // },
    // invitations: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   default: [],
    //   ref: "User",
    // },
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
