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
exports.rejectfriendRequest = exports.acceptFriendRequest = exports.sendFriendRequest = void 0;
const response_codes_1 = __importDefault(require("../../utils/response-codes"));
const User_1 = __importDefault(require("../../models/User"));
const Room_1 = __importDefault(require("../../models/Room"));
const sendFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { friendusername } = req.body;
        const uid = req.uid;
        console.log(" UID : ", uid);
        console.log(" f username : ", friendusername);
        if (!friendusername)
            return response_codes_1.default.badRequest(res, "Required friend username");
        const user = yield User_1.default.findById(uid).select("-password");
        if (!user)
            return response_codes_1.default.forbidden(res, "unauthorized");
        if (user.username === friendusername)
            return response_codes_1.default.badRequest(res, "Bad request");
        const friend = yield User_1.default.findOne({ username: friendusername }).select("-password");
        if (!friend)
            return response_codes_1.default.badRequest(res, `${friendusername} not found`);
        const isRequestExist = friend.friendRequestList.find((id) => id === uid);
        console.log(isRequestExist);
        if (isRequestExist)
            return response_codes_1.default.badRequest(res, "Request already send");
        friend.friendRequestList.push(uid);
        friend.save();
        return response_codes_1.default.success(res, { FROM: user, TO: friend }, "Request Send");
    }
    catch (error) {
        console.error(error);
        return response_codes_1.default.internalServerError(res, "Friend Request Failed");
    }
});
exports.sendFriendRequest = sendFriendRequest;
const acceptFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fid } = req.body;
        const uid = req.uid;
        console.log("UID : ", uid);
        console.log("FID : ", fid);
        if (!fid)
            return response_codes_1.default.badRequest(res, "Invalid FID");
        const user = yield User_1.default.findById(uid).select("-password");
        // check if friend request exist
        const index = user.friendRequestList.indexOf(fid);
        if (index === -1)
            return response_codes_1.default.notFound(res, "No Friend request found");
        // search for request having FID
        const friend = yield User_1.default.findById(fid).select("-password");
        // accept the request
        user.friendRequestList.splice(index, 1);
        const chatRoom = yield Room_1.default.create({
            participants: [uid, fid],
        });
        // add to friends list
        user.friendList.push({
            contactId: fid,
            roomId: chatRoom._id,
        });
        friend.friendList.push({
            contactId: uid,
            roomId: chatRoom._id,
        });
        user.save();
        friend.save();
        return response_codes_1.default.success(res, { user, chatRoom }, "Request Accepted");
    }
    catch (error) {
        return response_codes_1.default.internalServerError(res, "Internal Server Error");
    }
});
exports.acceptFriendRequest = acceptFriendRequest;
const rejectfriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fid } = req.body;
        const uid = req.uid;
        if (!fid)
            return response_codes_1.default.badRequest(res, "Invalid FID");
        const user = yield User_1.default.findById(uid).select("-password").exec();
        // check if friend request exist
        const index = user.friendRequestList.indexOf(fid);
        if (index === -1)
            return response_codes_1.default.notFound(res, "No Friend request found");
        // reject the request
        user.friendRequestList.splice(index, 1);
        yield user.save();
        return response_codes_1.default.success(res, user, "Rejected Successfully");
    }
    catch (error) {
        console.error(error);
        return response_codes_1.default.internalServerError(res, "Reject friend request Failed");
    }
});
exports.rejectfriendRequest = rejectfriendRequest;
