import mongoose, { models, Schema } from "mongoose";

const RoomSchema = new Schema(
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
    // muteNotification: {
    //   type: Boolean,
    //   default: false,
    // },
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

const Room = models.Room || mongoose.model("Room", RoomSchema, "rooms");

export default Room;
