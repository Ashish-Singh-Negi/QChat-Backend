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
exports.deleteChatMessages = exports.deleteMessageForMe = exports.deleteMessageForEveryone = exports.updateMessage = exports.sendMessage = exports.getMessages = void 0;
const response_codes_1 = __importDefault(require("../../utils/response-codes"));
const Message_1 = __importDefault(require("../../models/Message"));
const Room_1 = __importDefault(require("../../models/Room"));
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.query);
        const chatRoomId = req.query.crid;
        // console.log(" ChatRoomID is : ", chatRoomId);
        if (!chatRoomId)
            return response_codes_1.default.badRequest(res, "chatRoomId is Request");
        const chatRoom = yield Room_1.default.findById(chatRoomId).populate("messages");
        if (!chatRoom)
            return response_codes_1.default.notFound(res, "No chats exists");
        response_codes_1.default.success(res, chatRoom.messages, "Success");
    }
    catch (error) {
        console.log(error);
        response_codes_1.default.internalServerError(res, "GET Messages : Internal Server Error");
    }
});
exports.getMessages = getMessages;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, content, sender, receiver, room } = req.body;
        console.log("messageId : ", _id);
        const message = content.trim();
        if (!message) {
            response_codes_1.default.badRequest(res, "message is required");
        }
        console.log(" Message : ", message);
        console.log(" sendTo  : ", receiver);
        console.log(" sendBy  : ", sender);
        const messageDetails = yield Message_1.default.create({
            _id: _id,
            senderId: sender,
            receiverId: receiver,
            content: message,
        });
        const chatRoom = yield Room_1.default.findById(room).exec();
        chatRoom.messages.push(messageDetails._id);
        yield chatRoom.save();
        response_codes_1.default.success(res, {
            message: message,
        }, "Sended Successfuly");
    }
    catch (error) {
        console.error(error);
        response_codes_1.default.internalServerError(res, "POST Message : Internal Server Error");
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
                    const pinMessage = yield Message_1.default.findById(pinMessageId).exec();
                    pinMessage.isPinned = false;
                    pinMessage.save();
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
                const { mid } = req.body;
            }
            catch (error) {
                console.log(error);
            }
        default:
            break;
    }
});
exports.updateMessage = updateMessage;
const deleteChatMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { crid } = req.query;
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
        const { mid } = req.body;
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
        const { mid } = req.body;
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
