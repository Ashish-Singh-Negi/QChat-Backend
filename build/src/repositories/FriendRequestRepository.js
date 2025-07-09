"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRepository_1 = __importDefault(require("./BaseRepository"));
class FriendRequestRepository extends BaseRepository_1.default {
    constructor(friendRequestModel) {
        super(friendRequestModel);
        this.friendRequestModel = friendRequestModel;
    }
    create(sender, recipient, session) {
        return new this.friendRequestModel({
            sender: sender,
            recipient: recipient,
        }).save({ session });
    }
    findRequestById(fid, filter = "-__v", session) {
        return session
            ? this.friendRequestModel
                .findById(fid)
                .select(`${filter}`)
                .session(session)
            : this.friendRequestModel.findById(fid).select(`${filter}`).lean();
    }
    findOneBySenderAndRecipientUsername(senderUsername, recipientUsername) {
        return this.friendRequestModel.findOne({
            $or: [
                {
                    "sender.username": senderUsername,
                    "recipient.username": recipientUsername,
                },
                {
                    "sender.username": recipientUsername,
                    "recipient.username": senderUsername,
                },
            ],
        });
    }
}
exports.default = FriendRequestRepository;
