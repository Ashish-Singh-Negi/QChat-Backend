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
exports.rejectFriendRequest = exports.acceptFriendRequest = exports.sendFriendRequest = void 0;
const response_codes_1 = __importDefault(require("../../utils/response-codes"));
const User_1 = __importDefault(require("../../models/User"));
const Room_1 = __importDefault(require("../../models/Room"));
const Message_1 = __importDefault(require("../../models/Message"));
const sendFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { friendUsername } = req.body;
        const senderId = req.uid;
        console.log("UID:", senderId);
        console.log("Friend Username:", friendUsername);
        // Validate input
        if (!friendUsername) {
            return response_codes_1.default.badRequest(res, "Friend username is required.");
        }
        // Fetch sender details
        const sender = yield User_1.default.findById(senderId).select("-password");
        if (!sender) {
            return response_codes_1.default.forbidden(res, "Unauthorized request.");
        }
        // Prevent self-friend request
        if (sender.username === friendUsername) {
            return response_codes_1.default.badRequest(res, "You cannot send a friend request to yourself.");
        }
        // Fetch recipient details
        const recipient = yield User_1.default.findOne({ username: friendUsername }).select("-password");
        if (!recipient) {
            return response_codes_1.default.badRequest(res, `User '${friendUsername}' not found.`);
        }
        // Check if friend request already exists
        if (recipient.friendRequestList.includes(senderId)) {
            return response_codes_1.default.badRequest(res, "Friend request has already been sent.");
        }
        // Send friend request
        recipient.friendRequestList.push(senderId);
        yield recipient.save();
        return response_codes_1.default.success(res, { from: sender, to: recipient }, "Friend request sent successfully.");
    }
    catch (error) {
        console.error("Error sending friend request:", error);
        return response_codes_1.default.internalServerError(res, "Failed to send friend request.");
    }
});
exports.sendFriendRequest = sendFriendRequest;
const acceptFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fid } = req.params;
        const uid = req.uid;
        console.log("Accept Friend Request - UID:", uid, "FID:", fid);
        // Validate friend ID
        if (!fid) {
            return response_codes_1.default.badRequest(res, "Friend ID is required.");
        }
        // Fetch user data
        const user = yield User_1.default.findById(uid).select("-password");
        if (!user) {
            return response_codes_1.default.forbidden(res, "Unauthorized request.");
        }
        // Check if the friend request exists
        const requestIndex = user.friendRequestList.indexOf(fid);
        if (requestIndex === -1) {
            return response_codes_1.default.notFound(res, "No pending friend request found.");
        }
        // Fetch friend's data
        const friend = yield User_1.default.findById(fid).select("-password");
        if (!friend) {
            return response_codes_1.default.notFound(res, "Friend not found.");
        }
        // Remove the friend request from the list
        user.friendRequestList.splice(requestIndex, 1);
        console.log("friends Friendlist : ", friend.username, friend.contactList);
        const isRecentRoomExist = friend.contactList.find((friend) => friend.contactId.toString() === uid);
        if (isRecentRoomExist) {
            // search for existing room
            const chatRoom = yield Room_1.default.findById(isRecentRoomExist.roomId);
            // update chat room participants
            chatRoom.participants.push(uid);
            const roomMessage = yield Message_1.default.create({
                content: `${user.username} accepted friend request`,
            });
            chatRoom.messages.push(roomMessage._id);
            yield chatRoom.save();
            // update user contactList
            user.contactList.push({
                contactId: fid,
                roomId: isRecentRoomExist.roomId,
            });
        }
        else {
            // Create a chat room for both users
            const chatRoom = yield Room_1.default.create({ participants: [uid, fid] });
            // Update both users' friend lists with chat room reference
            const newFriendEntry = { contactId: fid, roomId: chatRoom._id };
            user.contactList.push(newFriendEntry);
            user.friendList.push(fid);
            friend.contactList.push({ contactId: uid, roomId: chatRoom._id });
            friend.friendList.push(uid);
        }
        // Save updates
        yield user.save();
        yield friend.save();
        return response_codes_1.default.success(res, { user }, "Friend request accepted successfully.");
    }
    catch (error) {
        console.error("Error accepting friend request:", error);
        return response_codes_1.default.internalServerError(res, "An error occurred while accepting the friend request.");
    }
});
exports.acceptFriendRequest = acceptFriendRequest;
const rejectFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fid } = req.params;
        const uid = req.uid;
        console.log("Reject Friend Request - UID:", uid, "FID:", fid);
        // Validate friend ID
        if (!fid) {
            return response_codes_1.default.badRequest(res, "Friend ID is required.");
        }
        // Fetch user details
        const user = yield User_1.default.findById(uid).select("-password").exec();
        if (!user) {
            return response_codes_1.default.forbidden(res, "Unauthorized request.");
        }
        // Check if the friend request exists
        const requestIndex = user.friendRequestList.indexOf(fid);
        if (requestIndex === -1) {
            return response_codes_1.default.notFound(res, "No pending friend request found.");
        }
        // Remove the friend request from the list
        user.friendRequestList.splice(requestIndex, 1);
        yield user.save();
        return response_codes_1.default.success(res, user, "Friend request rejected successfully.");
    }
    catch (error) {
        console.error("Error rejecting friend request:", error);
        return response_codes_1.default.internalServerError(res, "An error occurred while rejecting the friend request.");
    }
});
exports.rejectFriendRequest = rejectFriendRequest;
