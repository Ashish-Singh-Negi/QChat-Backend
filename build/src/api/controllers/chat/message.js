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
exports.deleteMessageForMe = exports.deleteMessageForEveryone = exports.updatePinMessage = exports.editMessage = exports.storeMessage = exports.getMessage = exports.getAllMessages = void 0;
const response_codes_1 = __importDefault(require("../../../utils/response-codes"));
const Chat_1 = __importDefault(require("../../../models/Chat"));
const Message_1 = __importDefault(require("../../../models/Message"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const BadRequestError_1 = __importDefault(require("../../../errors/BadRequestError"));
const message_1 = __importDefault(require("../../../services/message"));
const MessageRepository_1 = __importDefault(require("../../../repositories/MessageRepository"));
const ChatRepository_1 = __importDefault(require("../../../repositories/ChatRepository"));
const getAllMessages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { crid } = req.params;
    if (!crid)
        throw new BadRequestError_1.default({ message: "chat room id required" });
    const messageServiceInstance = new message_1.default(new MessageRepository_1.default(Message_1.default), new ChatRepository_1.default(Chat_1.default));
    const { messages } = yield messageServiceInstance.getAllChatMessage(crid);
    return response_codes_1.default.success(res, messages, "messages retrived successfully");
}));
exports.getAllMessages = getAllMessages;
const getMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mid } = req.params;
    if (!mid)
        throw new BadRequestError_1.default({
            message: "mid is required",
        });
    const messageServiceInstance = new message_1.default(new MessageRepository_1.default(Message_1.default), new ChatRepository_1.default(Chat_1.default));
    const message = yield messageServiceInstance.getMessage(mid);
    return response_codes_1.default.success(res, message, "message retrived successfully");
}));
exports.getMessage = getMessage;
const storeMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mid, content, senderId, recipientId, chatId } = req.body;
    if (!content.trim()) {
        return response_codes_1.default.badRequest(res, "Message content cannot be empty.");
    }
    console.log("Message content:", content);
    console.log("Sent to:", recipientId);
    console.log("Sent by:", senderId);
    const messageServiceInstance = new message_1.default(new MessageRepository_1.default(Message_1.default), new ChatRepository_1.default(Chat_1.default));
    const { createdMessage } = yield messageServiceInstance.storeMessage(mid, senderId, recipientId, content.trim(), chatId);
    return response_codes_1.default.success(res, createdMessage, "Message sent successfully.");
}));
exports.storeMessage = storeMessage;
const editMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mid, newContent } = req.body;
    if (!mid || !newContent)
        throw new BadRequestError_1.default({ message: "mid and new Content is required" });
    const messageServiceInstance = new message_1.default(new MessageRepository_1.default(Message_1.default), new ChatRepository_1.default(Chat_1.default));
    const { editedMessage } = yield messageServiceInstance.editMessage(mid, newContent);
    return response_codes_1.default.success(res, editedMessage, "Message Updated");
}));
exports.editMessage = editMessage;
const updatePinMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { crid, mid } = req.params;
    if (!mid || !crid) {
        return response_codes_1.default.badRequest(res, "Update Message : Bad Request");
    }
    const messageServiceInstance = new message_1.default(new MessageRepository_1.default(Message_1.default), new ChatRepository_1.default(Chat_1.default));
    const { message } = yield messageServiceInstance.pinMessage(crid, mid);
    return response_codes_1.default.success(res, { message }, "Message Pinned");
}));
exports.updatePinMessage = updatePinMessage;
const deleteMessageForEveryone = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mid } = req.params;
    if (!mid)
        return response_codes_1.default.badRequest(res, "DELETE Message for Everyone : Bad Request");
    const messageServiceInstance = new message_1.default(new MessageRepository_1.default(Message_1.default), new ChatRepository_1.default(Chat_1.default));
    yield messageServiceInstance.deleteMessageForEveryone(mid);
    response_codes_1.default.noContent(res);
}));
exports.deleteMessageForEveryone = deleteMessageForEveryone;
const deleteMessageForMe = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mid } = req.params;
    if (!mid)
        return response_codes_1.default.badRequest(res, "DELETE Message for Me : Bad Request");
    const messageServiceInstance = new message_1.default(new MessageRepository_1.default(Message_1.default), new ChatRepository_1.default(Chat_1.default));
    yield messageServiceInstance.deleteMessageForEveryone(mid);
    response_codes_1.default.noContent(res);
}));
exports.deleteMessageForMe = deleteMessageForMe;
