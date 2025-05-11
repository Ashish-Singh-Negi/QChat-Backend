import mongoose, { models, Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
      default: null,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
      default: null,
    },
    content: {
      type: String,
      require: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isStar: {
      type: Boolean,
      default: false,
    },
    visibleToEveryone: {
      type: Boolean,
      default: true,
    },
    visibleToSender: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message =
  models.Message || mongoose.model("Message", MessageSchema, "messages");

export default Message;
