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
exports.deleteChat = exports.disappearChatMessages = exports.updateChatSettings = exports.createChat = exports.getChatDetails = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const BadRequestError_1 = __importDefault(require("../../../errors/BadRequestError"));
const response_codes_1 = __importDefault(require("../../../utils/response-codes"));
const User_1 = __importDefault(require("../../../models/User"));
const Message_1 = __importDefault(require("../../../models/Message"));
const Chat_1 = __importDefault(require("../../../models/Chat"));
const UserRepository_1 = __importDefault(require("../../../repositories/UserRepository"));
const MessageRepository_1 = __importDefault(require("../../../repositories/MessageRepository"));
const ChatRepository_1 = __importDefault(require("../../../repositories/ChatRepository"));
const chat_1 = __importDefault(require("../../../services/chat"));
const getChatDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { crid } = req.params;
    const { filter } = req.query;
    if (!crid)
        return response_codes_1.default.badRequest(res, "chat room Id is required");
    const chatServiceInstance = new chat_1.default(new ChatRepository_1.default(Chat_1.default), new UserRepository_1.default(User_1.default), new MessageRepository_1.default(Message_1.default));
    const { chat } = yield chatServiceInstance.getChat(crid, filter);
    return response_codes_1.default.success(res, chat, "Chat room Details fetched successfully");
}));
exports.getChatDetails = getChatDetails;
const createChat = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fid } = req.body;
    const uid = req.uid;
    // Validate input
    if (!fid)
        throw new BadRequestError_1.default({ message: "fid is required" });
    if (!mongoose_1.default.Types.ObjectId.isValid(fid.toString()))
        throw new BadRequestError_1.default({ message: "Invalid fid" });
    const chatServiceInstance = new chat_1.default(new ChatRepository_1.default(Chat_1.default), new UserRepository_1.default(User_1.default), new MessageRepository_1.default(Message_1.default));
    const { chat } = yield chatServiceInstance.createChat(uid, fid);
    return response_codes_1.default.created(res, chat, "Chat Room Created");
}));
exports.createChat = createChat;
/**
 * @api {PATCH} /users/chats/:crid
 * @apiName UpdateChatRoom
 * @apiGroup Chat
 * @apiDescription Updates chat room settings or adds a new member.
 *
 * @apiParam {String} crid Chat Room ID.
 * @apiParam {String} disappearingMessages Enables disappearing messages.
 *
 * @apiSuccess {String} message Success message.
 * @apiError {String} error Error message.
 */
const updateChatSettings = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.uid;
    const { disappearingMessagesDuration } = req.body;
    const { crid } = req.params;
    if (!crid)
        throw new BadRequestError_1.default({ message: "chat room id required" });
    const chatServiceInstance = new chat_1.default(new ChatRepository_1.default(Chat_1.default), new UserRepository_1.default(User_1.default), new MessageRepository_1.default(Message_1.default));
    const { chat } = yield chatServiceInstance.updateChatDisappearingMessagesDuration(crid, disappearingMessagesDuration, uid);
    return response_codes_1.default.success(res, chat, "ChatRoom disappearing duration updated successfully");
}));
exports.updateChatSettings = updateChatSettings;
const disappearChatMessages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { crid } = req.params;
    if (!crid)
        throw new BadRequestError_1.default({ message: "chat id required" });
    const chatServiceInstance = new chat_1.default(new ChatRepository_1.default(Chat_1.default), new UserRepository_1.default(User_1.default), new MessageRepository_1.default(Message_1.default));
    yield chatServiceInstance.disappearChatMessages(crid);
    res.status(202).json({
        message: "Disappear message request accepted",
    });
}));
exports.disappearChatMessages = disappearChatMessages;
const deleteChat = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { crid } = req.params;
    if (!crid) {
        return response_codes_1.default.badRequest(res, "Chat room ID is required.");
    }
    const chatServiceInstance = new chat_1.default(new ChatRepository_1.default(Chat_1.default), new UserRepository_1.default(User_1.default), new MessageRepository_1.default(Message_1.default));
    yield chatServiceInstance.deleteChat(crid);
    return response_codes_1.default.noContent(res);
}));
exports.deleteChat = deleteChat;
