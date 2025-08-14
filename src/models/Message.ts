import mongoose, { models, Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
      default: null,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
      default: null,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      require: true,
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
    status: {
      type: String,
      enum: ["SEND", "DELIVERED", "SEEN"],
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
