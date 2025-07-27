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

const FriendsSchema = new Schema(
  {
    name: {
      type: String,
      default: null,
    },
    // id -> Friend Id
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    _id: false,
  }
);
const ChatsSchema = new Schema(
  {
    name: {
      type: String,
      default: null,
    },
    // id -> chat id
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
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
    isOnline: {
      type: Boolean,
      default: false,
    },
    isChatAllowForStrangers: {
      type: Boolean,
      default: false,
    },
    chats: {
      type: [ChatsSchema],
      default: [],
    },
    friends: {
      type: [FriendsSchema],
      default: [],
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
