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
exports.deleteChatMessages = exports.deleteMessageForMe = exports.deleteMessageForEveryone = exports.updateMessage = exports.sendMessage = exports.getMessage = exports.getMessages = void 0;
const response_codes_1 = __importDefault(require("../../utils/response-codes"));
const Message_1 = __importDefault(require("../../models/Message"));
const Room_1 = __importDefault(require("../../models/Room"));
const User_1 = __importDefault(require("../../models/User"));
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { crid } = req.params;
        const { filter } = req.query;
        console.log("CRID:", crid);
        if (!crid) {
            return response_codes_1.default.badRequest(res, "Chat Room ID is required to fetch messages.");
        }
        let chatRoom;
        // If a filter is provided, fetch the chat room with selected fields and populate related messages
        if (filter) {
            chatRoom = yield Room_1.default.findById(crid)
                .select(`${filter}`)
                .populate("messages");
            // .populate("roomMessages");
            console.log("Filtered:", chatRoom);
        }
        else {
            chatRoom = yield Room_1.default.findById(crid).exec();
        }
        if (!chatRoom) {
            return response_codes_1.default.notFound(res, "No conversation found for the given ID.");
        }
        // Construct response based on filter presence
        const responseData = filter
            ? { messages: chatRoom.messages }
            : chatRoom;
        return response_codes_1.default.success(res, responseData, "Messages retrieved successfully.");
    }
    catch (error) {
        console.error("Error fetching messages:", error);
        return response_codes_1.default.internalServerError(res, "An unexpected error occurred while retrieving messages. Please try again later.");
    }
});
exports.getMessages = getMessages;
const getMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mid } = req.params;
        console.log("MID:", mid);
        if (!mid) {
            return response_codes_1.default.badRequest(res, "Message ID is required to fetch the message.");
        }
        // Retrieve the message by its ID
        const message = yield Message_1.default.findById(mid);
        if (!message) {
            return response_codes_1.default.notFound(res, "No message found for the given ID.");
        }
        // Respond with the retrieved message
        return response_codes_1.default.success(res, message, "Message retrieved successfully.");
    }
    catch (error) {
        console.error("Error fetching message:", error);
        return response_codes_1.default.internalServerError(res, "An unexpected error occurred while retrieving the message. Please try again later.");
    }
});
exports.getMessage = getMessage;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, content, sender, receiver, room } = req.body;
        console.log("Message ID:", _id);
        const message = content.trim();
        if (!message) {
            return response_codes_1.default.badRequest(res, "Message content cannot be empty.");
        }
        console.log("Message:", message);
        console.log("Sent to:", receiver);
        console.log("Sent by:", sender);
        // Create the message entry in the database
        const messageDetails = yield Message_1.default.create({
            _id,
            senderId: sender,
            receiverId: receiver,
            content: message,
        });
        // Find the chat room and associate the message with it
        const chatRoom = yield Room_1.default.findById(room).exec();
        if (!chatRoom) {
            return response_codes_1.default.notFound(res, "Chat room not found.");
        }
        chatRoom.messages.push(messageDetails._id);
        yield chatRoom.save();
        return response_codes_1.default.success(res, { message }, "Message sent successfully.");
    }
    catch (error) {
        console.error("Error sending message:", error);
        return response_codes_1.default.internalServerError(res, "An unexpected error occurred while sending the message. Please try again later.");
    }
});
exports.sendMessage = sendMessage;
const updateMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { action } = req.body;
    switch (action) {
        case "EDIT":
            try {
                const { mid, newContent } = req.body;
                if (!mid || !newContent)
                    return response_codes_1.default.badRequest(res, "Update Message : Bad Request");
                console.log("MID : ", mid, "NEW Content : ", newContent);
                const message = yield Message_1.default.findById(mid).select("-v").exec();
                if (!message)
                    return response_codes_1.default.notFound(res, "Message No longer exit");
                message.content = newContent;
                message.isEdited = true;
                message.save();
                response_codes_1.default.success(res, { message }, "Message Updated");
            }
            catch (error) {
                console.log(error);
                response_codes_1.default.internalServerError(res, "update MESSAGE Internal Server Error");
            }
            break;
        case "PIN":
            try {
                const { mid, crid } = req.body;
                if (!mid || !crid)
                    return response_codes_1.default.badRequest(res, "Update Message : Bad Request");
                console.log("MID : ", mid);
                // Search for message
                const message = yield Message_1.default.findById(mid).select("-v").exec();
                if (!message)
                    return response_codes_1.default.notFound(res, "Message No longer exit");
                // Search for ChatRoom
                const chatRoom = yield Room_1.default.findById(crid).select("-v").exec();
                // Store pinned message count/length
                const pinMessagesCount = chatRoom.pinMessages.length;
                // Store pinned message index
                const isPinnedIndex = chatRoom.pinMessages.indexOf(mid);
                console.log("IS Pinned : ", isPinnedIndex);
                // if pinned message exist in pinMessages array
                // than remove it And set it false
                if (isPinnedIndex >= 0) {
                    chatRoom.pinMessages.splice(isPinnedIndex, 1);
                    message.isPinned = false;
                    chatRoom.save();
                    message.save();
                    return response_codes_1.default.success(res, { message }, "Message Updated");
                }
                if (pinMessagesCount < 3) {
                    chatRoom.pinMessages.push(mid);
                    message.isPinned = true;
                }
                else {
                    const pinMessageId = chatRoom.pinMessages[0];
                    const pinMessage = yield Message_1.default.findById(pinMessageId);
                    if (pinMessage) {
                        pinMessage.isPinned = false;
                        pinMessage.save();
                    }
                    chatRoom.pinMessages.shift();
                    chatRoom.pinMessages.push(mid);
                    message.isPinned = true;
                }
                chatRoom.save();
                message.save();
                response_codes_1.default.success(res, { message }, "Message Updated");
            }
            catch (error) {
                console.log(error);
                response_codes_1.default.internalServerError(res, "update MESSAGE Internal Server Error");
            }
            break;
        case "STAR":
            try {
                const { uid, mid } = req.body;
                const message = yield Message_1.default.findById(mid).exec();
                const isStar = message.isStar;
                const user = yield User_1.default.findById(uid).select("-password").exec();
                if (isStar) {
                    console.log("Remove star message");
                    message.isStar = false;
                    const index = user.starMessages.indexOf(mid);
                    user.starMessages.splice(index, 1);
                }
                else {
                    console.log("Add star message");
                    message.isStar = true;
                    user.starMessages.push(mid);
                }
                yield user.save();
                yield message.save();
                return response_codes_1.default.success(res, { message, user }, "Message Stared");
            }
            catch (error) {
                console.log(error);
                return response_codes_1.default.internalServerError(res, "Star Internal Server Error");
            }
            break;
        default:
            break;
    }
});
exports.updateMessage = updateMessage;
const deleteChatMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { crid } = req.params;
        console.log("CRID  ", crid);
        if (!crid)
            return response_codes_1.default.badRequest(res, "DELETE Chat Message : Bad Request");
        const room = yield Room_1.default.findById(crid).exec();
        let messages = room.messages;
        yield Message_1.default.deleteMany({
            _id: {
                $in: messages,
            },
        });
        room.messages = [];
        yield room.save();
        response_codes_1.default.noContent(res);
    }
    catch (error) {
        console.log(error);
        response_codes_1.default.internalServerError(res, "delete Message Internal Server message");
    }
});
exports.deleteChatMessages = deleteChatMessages;
const deleteMessageForEveryone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mid } = req.params;
        console.log("MID : ", mid);
        if (!mid)
            return response_codes_1.default.badRequest(res, "DELETE Message : Bad Request");
        const message = yield Message_1.default.findById(mid).exec();
        message.visibleToEveryone = false;
        yield message.save();
        response_codes_1.default.noContent(res);
    }
    catch (error) {
        console.log(error);
        response_codes_1.default.internalServerError(res, "delete Message Internal Server message");
    }
});
exports.deleteMessageForEveryone = deleteMessageForEveryone;
const deleteMessageForMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mid } = req.params;
        console.log(mid);
        if (!mid)
            return response_codes_1.default.badRequest(res, "DELETE Message for Me : Bad Request");
        const message = yield Message_1.default.findById(mid).select("-v");
        message.visibleToSender = false;
        yield message.save();
        response_codes_1.default.noContent(res);
    }
    catch (error) {
        console.log(error);
        response_codes_1.default.internalServerError(res, "delete Message Internal Server message");
    }
});
exports.deleteMessageForMe = deleteMessageForMe;
