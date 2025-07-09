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
const mongoose_1 = __importDefault(require("mongoose"));
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const ConflictError_1 = __importDefault(require("../errors/ConflictError"));
const disappearingMessagesDurations = {
    "24 hours": "24h",
    "7 days": "7d",
    "1 month": "1m",
    OFF: "OFF",
};
class ChatService {
    constructor(chatRepo, userRepo, messageRepo) {
        this.chatRepo = chatRepo;
        this.userRepo = userRepo;
        this.messageRepo = messageRepo;
    }
    getChat(crid, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatRecord = yield this.chatRepo.findChatById(crid, filter);
            if (!chatRecord)
                throw new NotFoundError_1.default({
                    message: `chat with id ${crid} Not Found`,
                });
            return { chat: chatRecord };
        });
    }
    createChat(userId, friendId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const participants = [userId, friendId].sort();
                const isChatExist = yield this.chatRepo.findOneByParticipants(participants);
                if (isChatExist)
                    throw new ConflictError_1.default({ message: `Chat already exists` });
                const newChat = yield this.chatRepo.createChat({
                    participants: participants,
                }, session);
                console.log(newChat);
                const [userRecord, friendRecord] = yield Promise.all([
                    yield this.userRepo.findUserById(userId, "chats", session),
                    yield this.userRepo.findUserById(friendId, "chats", session),
                ]);
                if (!userRecord)
                    throw new NotFoundError_1.default({ message: "User Details Not Found" });
                if (!friendRecord)
                    throw new NotFoundError_1.default({ message: "friend Details Not Found" });
                userRecord.chats.push(newChat._id);
                friendRecord.chats.push(newChat._id);
                yield this.userRepo.save(userRecord, session);
                yield this.userRepo.save(friendRecord, session);
                yield session.commitTransaction();
                return { chat: newChat };
            }
            catch (error) {
                yield session.abortTransaction();
                console.log(error);
                throw error;
            }
            finally {
                session.endSession();
            }
        });
    }
    updateChatDisappearingMessagesDuration(crid, duration, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const chatRecord = yield this.chatRepo.findChatById(crid, "", session);
                if (!chatRecord)
                    throw new NotFoundError_1.default({ message: "Chat Not Found" });
                const messageContent = duration === "OFF"
                    ? `${userId}: turned off disappearing messages.`
                    : `${userId}: turned on disappearing messages. New messages will disappear from this chat ${duration} after they're sent.`;
                const message = yield this.messageRepo.createMessage({
                    content: messageContent,
                }, session);
                chatRecord.disappearingMessages = disappearingMessagesDurations[duration];
                chatRecord.messages.push(message[0]._id);
                yield this.chatRepo.save(chatRecord, session);
                yield this.messageRepo.save(message[0], session);
                yield session.commitTransaction();
                return { chat: chatRecord };
            }
            catch (error) {
                yield session.abortTransaction();
                console.log(error);
                throw error;
            }
            finally {
                session.endSession();
            }
        });
    }
    disappearChatMessages(crid) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const chatRecord = yield this.chatRepo.findChatById(crid, "messages disappearingMessages", session);
                console.log(chatRecord);
                const messages = chatRecord.messages;
                const duration = chatRecord.disappearingMessages;
                // time constants in milliseconds
                const ONE_DAY_IN_MILLI_SECONDS = 1000 * 60 * 60 * 24;
                const SEVEN_DAY_IN_MILLI_SECONDS = 1000 * 60 * 60 * 24 * 7;
                const ONE_MONTH_IN_MILLI_SECONDS = 1000 * 60 * 60 * 24 * 30;
                const currentTime = new Date().getTime();
                let messagesToDisappearAre = [];
                let disappearDurationInMS;
                if (duration === "24h") {
                    disappearDurationInMS = ONE_DAY_IN_MILLI_SECONDS;
                }
                else if (duration === "7d") {
                    disappearDurationInMS = SEVEN_DAY_IN_MILLI_SECONDS;
                }
                else if (duration === "1m") {
                    disappearDurationInMS = ONE_MONTH_IN_MILLI_SECONDS;
                }
                for (let i = 0; i < messages.length; i++) {
                    console.log(messages[i].createdAt);
                    const messageCreatedTime = new Date(messages[i].createdAt).getTime();
                    const messageCreatedTimeInMS = currentTime - messageCreatedTime;
                    console.log(currentTime, " - ", messageCreatedTime, " = ", messageCreatedTimeInMS, ONE_DAY_IN_MILLI_SECONDS);
                    if (messageCreatedTimeInMS > disappearDurationInMS) {
                        messagesToDisappearAre.push(messages[i]._id);
                        messages.splice(i, 1);
                    }
                }
                yield this.messageRepo.deleteManyById(messagesToDisappearAre, session);
                yield this.chatRepo.save(chatRecord, session);
                yield session.commitTransaction();
            }
            catch (error) {
                yield session.abortTransaction();
                console.error(error);
                throw error;
            }
            finally {
                session.endSession();
            }
        });
    }
    deleteChat(crid) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const chatRecord = yield this.chatRepo.findChatById(crid, "", session);
                if (!chatRecord)
                    throw new NotFoundError_1.default({ message: "Chat Not Found" });
                const messages = chatRecord.messages;
                yield this.messageRepo.deleteManyById(messages, session);
                yield this.chatRepo.save(chatRecord, session);
                session.commitTransaction();
            }
            catch (error) {
                session.abortTransaction();
                throw error;
            }
            finally {
                session.endSession();
            }
        });
    }
}
exports.default = ChatService;
