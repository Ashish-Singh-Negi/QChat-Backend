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
class MessageService {
    constructor(messageRepo, chatRepo) {
        this.messageRepo = messageRepo;
        this.chatRepo = chatRepo;
    }
    getAllChatMessage(crid) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield this.chatRepo.findChatById(crid, "messages");
            if (!messages)
                throw new NotFoundError_1.default({ message: "Chat Messages Not Found" });
            // const messages = await this.messageRepo.findAllChatMessages(
            //   chatRecord.messages
            // );
            // if (!messages)
            //   throw new NotFoundError({ message: "chat messages Not Found" });
            return { messages: messages };
        });
    }
    getMessage(mid) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.messageRepo.findById(mid, true);
            if (!message)
                throw new NotFoundError_1.default({ message: "Message Not Found" });
            return message;
        });
    }
    storeMessage(mid, senderId, recipientId, content, chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const newMessageRecord = yield this.messageRepo.createMessage({
                    _id: mid,
                    content,
                    senderId,
                    recipientId,
                }, session);
                const chatRecord = yield this.chatRepo.findChatById(chatId);
                if (!chatRecord)
                    throw new NotFoundError_1.default({ message: "Chat Not Found" });
                chatRecord.messages.push(mid);
                yield this.messageRepo.save(newMessageRecord[0], session);
                yield this.chatRepo.save(chatRecord, session);
                yield session.commitTransaction();
                return { createdMessage: newMessageRecord };
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
    editMessage(mid, newContent) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageRecord = yield this.messageRepo.findById(mid, false);
            if (!messageRecord)
                throw new NotFoundError_1.default({ message: "Message Not Found" });
            messageRecord.content = newContent;
            messageRecord.isEdited = true;
            yield this.messageRepo.save(messageRecord);
            return { editedMessage: messageRecord };
        });
    }
    pinMessage(crid, mid) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const chatRecord = yield this.chatRepo.findChatById(crid, "pinMessages", session);
                console.log(chatRecord);
                if (!chatRecord)
                    throw new NotFoundError_1.default({ message: "Chat Not Found" });
                const messageRecord = yield this.messageRepo.findMessageById(mid, "", session);
                console.log(messageRecord);
                if (!messageRecord)
                    throw new NotFoundError_1.default({ message: "Message Not Found" });
                const isPinned = chatRecord.pinMessages.indexOf(mid);
                const pinMessagesCount = chatRecord.pinMessages.length;
                if (isPinned > -1) {
                    // Unpin
                    chatRecord.pinMessages.splice(isPinned, 1);
                    messageRecord.isPinned = false;
                }
                else {
                    // Pin
                    if (pinMessagesCount >= 3) {
                        const pinMessageId = chatRecord.pinMessages.shift(); // Remove oldest
                        const pinMessage = yield this.messageRepo.findMessageById(pinMessageId, "", session);
                        if (pinMessage) {
                            pinMessage.isPinned = false;
                            yield this.messageRepo.save(pinMessage, session);
                        }
                    }
                    chatRecord.pinMessages.push(mid);
                    messageRecord.isPinned = true;
                }
                yield this.messageRepo.save(messageRecord, session);
                yield this.chatRepo.save(chatRecord, session);
                console.log(messageRecord);
                console.log(chatRecord);
                yield session.commitTransaction();
                return {
                    message: messageRecord,
                };
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
    deleteMessageForEveryone(mid) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageRecord = yield this.messageRepo.findById(mid, false);
            if (!messageRecord)
                throw new NotFoundError_1.default({ message: "Message Not Found" });
            messageRecord.visibleToEveryone = false;
            yield this.messageRepo.save(messageRecord);
        });
    }
    deleteMessageForMe(mid) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageRecord = yield this.messageRepo.findById(mid, false);
            if (!messageRecord)
                throw new NotFoundError_1.default({ message: "Message Not Found" });
            messageRecord.visibleToSender = false;
            yield this.messageRepo.save(messageRecord);
        });
    }
}
exports.default = MessageService;
