import mongoose, { models, Schema } from "mongoose";

const ChatSchema = new Schema(
  {
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      require: true,
      ref: "User",
    },
    messages: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "Message",
    },
    pinMessages: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "Message",
    },
    disappearingMessages: {
      type: String,
      enum: ["24h", "7d", "1m", "OFF"],
      default: "OFF",
    },
  },
  {
    timestamps: true,
  }
);

const Chat = models.Chat || mongoose.model("Chat", ChatSchema, "chats");

export default Chat;
