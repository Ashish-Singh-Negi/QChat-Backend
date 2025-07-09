"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRepository_1 = __importDefault(require("./BaseRepository"));
const TAILWIND_COLORS = [
    "slate",
    "gray",
    "zinc",
    "neutral",
    "stone",
    "red",
    "orange",
    "yellow",
    "lime",
    "green",
    "emerald",
    "teal",
    "cyan",
    "sky",
    "blue",
    "indigo",
    "violet",
    "purple",
    "fuchsia",
    "pink",
    "rose",
];
class UserRepository extends BaseRepository_1.default {
    constructor(userModel) {
        super(userModel);
        this.userModel = userModel;
    }
    createUser(userDTO) {
        const profilePicColor = TAILWIND_COLORS[Math.floor(Math.random() * 22)];
        const profilePicBgColor = `bg-${profilePicColor}-950 text-${profilePicColor}-300`;
        return this.userModel.create(Object.assign(Object.assign({}, userDTO), { profilePic: profilePicBgColor }));
    }
    getAllUser(query, limit = 10) {
        return this.userModel.find().select(`${query}`).limit(limit).lean();
    }
    findUserById(id, filter = "-password -__v", session) {
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
    findOneAndUpdateUserFriendRequestsByRemovingRID(username, rid, session) {
        return this.userModel
            .findOneAndUpdate({ username: username }, {
            $pull: { friendRequests: rid },
        })
            .session(session);
    }
}
exports.default = UserRepository;
