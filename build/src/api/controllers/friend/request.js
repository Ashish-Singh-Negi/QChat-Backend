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
exports.rejectFriendRequest = exports.acceptFriendRequest = exports.sendFriendRequest = exports.getFriendRequest = void 0;
const response_codes_1 = __importDefault(require("../../../utils/response-codes"));
const FriendRequest_1 = __importDefault(require("../../../models/FriendRequest"));
const User_1 = __importDefault(require("../../../models/User"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const friendRequest_1 = __importDefault(require("../../../services/friendRequest"));
const BadRequestError_1 = __importDefault(require("../../../errors/BadRequestError"));
const FriendRequestRepository_1 = __importDefault(require("../../../repositories/FriendRequestRepository"));
const UserRepository_1 = __importDefault(require("../../../repositories/UserRepository"));
const getFriendRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rid } = req.params;
    if (!rid)
        return response_codes_1.default.badRequest(res, "Request Id is required");
    const friendRequestInstance = new friendRequest_1.default(new FriendRequestRepository_1.default(FriendRequest_1.default), new UserRepository_1.default(User_1.default));
    const request = yield friendRequestInstance.getFriendRequest(rid);
    return response_codes_1.default.success(res, request, "successed");
}));
exports.getFriendRequest = getFriendRequest;
const sendFriendRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { friendUsername } = req.body;
    const senderUsername = req.name;
    if (!friendUsername)
        throw new BadRequestError_1.default({ message: "friend username is required" });
    const friendRequestServiceInstance = new friendRequest_1.default(new FriendRequestRepository_1.default(FriendRequest_1.default), new UserRepository_1.default(User_1.default));
    const { sender, recipient } = yield friendRequestServiceInstance.sendFriendRequest(senderUsername, friendUsername);
    return response_codes_1.default.success(res, { from: sender, to: recipient }, "Friend request sent successfully.");
}));
exports.sendFriendRequest = sendFriendRequest;
const acceptFriendRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rid } = req.params;
    if (!rid)
        throw new BadRequestError_1.default({ message: "request id is required" });
    const friendRequestInstance = new friendRequest_1.default(new FriendRequestRepository_1.default(FriendRequest_1.default), new UserRepository_1.default(User_1.default));
    const { friendRequest } = yield friendRequestInstance.acceptFriendRequest(rid);
    return response_codes_1.default.success(res, { friendRequest }, "Friend request accepted successfully.");
}));
exports.acceptFriendRequest = acceptFriendRequest;
const rejectFriendRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rid } = req.params;
    if (!rid)
        throw new BadRequestError_1.default({ message: "request id is required" });
    const friendRequestInstance = new friendRequest_1.default(new FriendRequestRepository_1.default(FriendRequest_1.default), new UserRepository_1.default(User_1.default));
    yield friendRequestInstance.rejectFriendRequest(rid);
    return response_codes_1.default.noContent(res);
}));
exports.rejectFriendRequest = rejectFriendRequest;
