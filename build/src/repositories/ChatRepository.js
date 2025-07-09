"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRepository_1 = __importDefault(require("./BaseRepository"));
class ChatRepository extends BaseRepository_1.default {
    constructor(chatModel) {
        super(chatModel);
        this.chatModel = chatModel;
    }
    findChatById(crid, filter = "-__v", session) {
        return session
            ? this.chatModel.findById(crid).select(`${filter}`).session(session)
            : this.chatModel.findById(crid).select(`${filter}`).populate("messages");
    }
    findOneByParticipants(participants) {
        return this.chatModel.findOne({
            participants: {
                $all: participants,
            },
        });
    }
    createChat(data, session) {
        return new this.chatModel(Object.assign({}, data)).save({ session });
    }
}
exports.default = ChatRepository;
