"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRepository_1 = __importDefault(require("./BaseRepository"));
class MessageRepository extends BaseRepository_1.default {
    constructor(messageModel) {
        super(messageModel);
        this.messageModel = messageModel;
    }
    findMessageById(mid, filter = "-__v", session) {
        return session
            ? this.messageModel.findById(mid).select(`${filter}`).session(session)
            : this.messageModel.findById(mid).select(`${filter}`).lean();
    }
    createMessage(context, session) {
        return this.messageModel.create([
            Object.assign({}, context),
        ], { session });
    }
    deleteManyById(messages, session) {
        return this.messageModel
            .deleteMany({ _id: { $in: messages } })
            .session(session);
    }
}
exports.default = MessageRepository;
