"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const ConflictError_1 = __importDefault(require("../errors/ConflictError"));
const mongoose_1 = __importDefault(require("mongoose"));
class FriendRequestService {
    constructor(friendRequestRepo, userRepo) {
        this.friendRequestRepo = friendRequestRepo;
        this.userRepo = userRepo;
    }
    getFriendRequest(rid) {
        return this.friendRequestRepo.findRequestById(rid);
    }
    sendFriendRequest(username, friendUsername) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const senderRecord = yield this.userRepo.findByUsername(username, "friends friendRequests username profilePic", session);
                if (!senderRecord)
                    throw new NotFoundError_1.default({ message: "Sender not found" });
                const recipientRecord = yield this.userRepo.findByUsername(friendUsername, "friends friendRequests username profilePic", session);
                if (!recipientRecord)
                    throw new NotFoundError_1.default({ message: "Invalid username" });
                const isAlreadyfriend = senderRecord.friends.some((fid) => fid.toString() === recipientRecord._id.toString());
                if (isAlreadyfriend)
                    throw new ConflictError_1.default({
                        message: `${friendUsername} is already in friends`,
                    });
                const sender = {
                    username: senderRecord.username,
                    profilePic: senderRecord.profilePic,
                };
                const recipient = {
                    username: recipientRecord.username,
                    profilePic: recipientRecord.profilePic,
                };
                const isFriendRequestExist = yield this.friendRequestRepo.findOneBySenderAndRecipientUsername(sender.username, recipient.username);
                if (isFriendRequestExist)
                    throw new ConflictError_1.default({ message: `friend request already send` });
                const friendRequestRecord = yield this.friendRequestRepo.create(sender, recipient, session);
                // add to request to friend requests
                senderRecord.friendRequests.push(friendRequestRecord._id);
                recipientRecord.friendRequests.push(friendRequestRecord._id);
                yield this.userRepo.save(senderRecord, session);
                yield this.userRepo.save(recipientRecord, session);
                yield this.friendRequestRepo.save(friendRequestRecord, session);
                yield session.commitTransaction();
                return { sender, recipient };
            }
            catch (error) {
                yield session.abortTransaction();
                console.error(error);
                throw error;
            }
            finally {
                yield session.endSession();
            }
        });
    }
    acceptFriendRequest(rid) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const friendRequest = yield this.friendRequestRepo.findRequestById(rid, "", session);
                if (!friendRequest)
                    throw new NotFoundError_1.default({ message: "Friend request not found" });
                const senderUsername = friendRequest.sender.username;
                const recipientUsername = friendRequest.recipient.username;
                const [senderRecord, recipientRecord] = yield Promise.all([
                    this.userRepo.findByUsername(senderUsername, "friends friendRequests username profilePic", session),
                    this.userRepo.findByUsername(recipientUsername, "friends friendRequests username profilePic", session),
                ]);
                if (!senderRecord || !recipientRecord)
                    throw new NotFoundError_1.default({ message: "not found" });
                // add user to friends
                this.addToFriends(senderRecord, recipientRecord, rid);
                friendRequest.status = "accepted";
                console.log(senderRecord);
                console.log(recipientRecord);
                yield this.friendRequestRepo.deleteById(friendRequest._id, session);
                yield this.userRepo.save(senderRecord, session);
                yield this.userRepo.save(recipientRecord, session);
                yield session.commitTransaction();
                return { friendRequest };
            }
            catch (error) {
                yield session.abortTransaction();
                console.error(error);
                throw error;
            }
            finally {
                yield session.endSession();
            }
        });
    }
    addToFriends(sender, recipient, rid) {
        return __awaiter(this, void 0, void 0, function* () {
            sender.friends.push(recipient._id);
            recipient.friends.push(sender._id);
            sender.friendRequests = sender.friendRequests.filter((requestId) => requestId.toString() !== rid);
            recipient.friendRequests = recipient.friendRequests.filter((requestId) => requestId.toString() !== rid);
        });
    }
    rejectFriendRequest(rid) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const friendRequestRecord = yield this.friendRequestRepo.findRequestById(rid, "", session);
                if (!friendRequestRecord)
                    throw new NotFoundError_1.default({ message: "Friend request not found" });
                const senderUsername = friendRequestRecord.sender.username;
                const recipientUsername = friendRequestRecord.recipient.username;
                const senderRecord = yield this.userRepo.findByUsername(senderUsername, "friendRequests username", session);
                if (!senderRecord)
                    throw new NotFoundError_1.default({ message: "sender Not Found" });
                const recipientRecord = yield this.userRepo.findByUsername(recipientUsername, "friendRequests username", session);
                if (!recipientRecord)
                    throw new NotFoundError_1.default({ message: "recipient Not Found" });
                senderRecord.friendRequests = senderRecord.friendRequests.filter((requestId) => requestId.toString() !== rid);
                recipientRecord.friendRequests = recipientRecord.friendRequests.filter((requestId) => requestId.toString() !== rid);
                friendRequestRecord.status = "rejected";
                // Delete friend request
                yield this.friendRequestRepo.deleteById(friendRequestRecord._id, session);
                yield this.userRepo.save(senderRecord, session);
                yield this.userRepo.save(recipientRecord, session);
                console.log(friendRequestRecord);
                yield session.commitTransaction();
            }
            catch (error) {
                yield session.abortTransaction();
                throw error;
            }
            finally {
                yield session.endSession();
            }
        });
    }
}
exports.default = FriendRequestService;
