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
exports.removeFriend = void 0;
const response_codes_1 = __importDefault(require("../../utils/response-codes"));
const User_1 = __importDefault(require("../../models/User"));
const Room_1 = __importDefault(require("../../models/Room"));
const Message_1 = __importDefault(require("../../models/Message"));
const removeFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fid } = req.params;
        const uid = req.uid;
        if (!fid)
            return response_codes_1.default.badRequest(res, "Invalid Friend ID");
        // Retrieve user and exclude password
        const user = yield User_1.default.findById(uid).select("-password");
        console.log("User:", user);
        // Locate friend in user's contact list
        const contactIndex = user.contactList.findIndex((friend) => friend.contactId.toString() === fid);
        if (contactIndex === -1)
            return response_codes_1.default.notFound(res, "contact already removed");
        const friendIndex = user.friendList.findIndex((friend) => friend.toString() === fid);
        if (friendIndex === -1)
            return response_codes_1.default.notFound(res, "Friend already removed");
        // Extract roomId for future use
        const { roomId } = user.contactList[contactIndex];
        // Remove friend from the friend list & contact list
        user.friendList.splice(friendIndex, 1);
        user.contactList.splice(contactIndex, 1);
        yield user.save(); // Save changes to user
        // Retrieve room details
        const room = yield Room_1.default.findById(roomId);
        // Identify user in room participants
        const userIndex = room.participants.indexOf(uid);
        console.log("Participant Index:", userIndex);
        // Remove user from room participants
        if (userIndex > -1)
            room.participants.splice(userIndex, 1);
        if (room.participants.length > 0) {
            // Notify remaining participants in the room
            const roomMesssage = yield Message_1.default.create({
                content: `${user.username} is no longer your friend. To start a conversation, send friend request.`,
            });
            room.messages.push(roomMesssage._id);
            yield room.save(); // Save changes to room
        }
        else {
            // Delete room if empty
            yield Room_1.default.findByIdAndDelete(roomId);
        }
        return response_codes_1.default.success(res, { user, room }, "Friend Removed");
    }
    catch (error) {
        console.error("Error:", error);
        return response_codes_1.default.internalServerError(res, "Failed to remove friend");
    }
});
exports.removeFriend = removeFriend;
