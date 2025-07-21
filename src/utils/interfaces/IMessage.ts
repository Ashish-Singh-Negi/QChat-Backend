import { ObjectId } from "mongoose";

export interface IMessage {
  _id: ObjectId;
  senderId: string;
  recipientId: string;
  content: string;
  isEdited: boolean;
  isPinned: boolean;
  isStar: boolean;
  visibleToEveryone: boolean;
  visibleToSender: boolean;
  createdAt: Date;
  updatedAt: Date;
}
