import mongoose, { models, Schema } from "mongoose";

const ParticipantsSchema = new Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  role: {
    type: String,
    enum: ["MEMBER", "ADMIN"],
    default: "MEMBER",
  },
});

const GroupChatSchema = new Schema(
  {
    groupName: {
      type: String,
      require: true,
    },
    groupDescription: {
      type: String,
      require: true,
    },
    groupIcon: {
      type: String,
      require: true,
    },
    participants: {
      type: [ParticipantsSchema],
      default: [],
    },
    groupPermission: {
      type: {
        editGroupSettings: Boolean,
        sendMessage: Boolean,
        addMember: Boolean,
      },
      require: true,
    },
    pinMessages: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const GroupChat =
  models.GroupChat ||
  mongoose.model("GroupChat", GroupChatSchema, "group_chats");

export default GroupChat;
