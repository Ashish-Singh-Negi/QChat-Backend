"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRepository_1 = __importDefault(require("./BaseRepository"));
class FriendRepository extends BaseRepository_1.default {
    constructor(userModel) {
        super(userModel);
        this.userModel = userModel;
    }
    findfriendById(id, filter = "-password -__v", session) {
        return session
            ? this.userModel.findById(id).select(`${filter}`).session(session)
            : this.userModel.findById(id).select(`${filter}`).lean();
    }
    findByUsername(username, filter = "-password -__v", session) {
        return session
            ? this.userModel
                .findOne({ username: username })
                .select(`${filter}`)
                .session(session)
            : this.userModel
                .findOne({ username: username })
                .select(`${filter}`)
                .lean();
    }
}
exports.default = FriendRepository;
