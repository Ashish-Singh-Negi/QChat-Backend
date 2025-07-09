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
const response_codes_1 = __importDefault(require("../../../utils/response-codes"));
const User_1 = __importDefault(require("../../../models/User"));
const removeFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fid } = req.params;
        const uid = req.uid;
        if (!fid) {
            return response_codes_1.default.badRequest(res, "Friend ID is required.");
        }
        // Fetch user and friend details while excluding unnecessary fields
        const user = yield User_1.default.findById(uid).select("-password -contactRoomList -createdAt -updatedAt -profilePic");
        if (!user) {
            return response_codes_1.default.notFound(res, "User not found.");
        }
        const friend = yield User_1.default.findById(fid).select("-password -contactRoomList -createdAt -updatedAt -profilePic");
        if (!friend) {
            return response_codes_1.default.notFound(res, "Friend not found.");
        }
        // Remove friend ID from user's friend list
        const friendIndex = user.friends.indexOf(fid);
        if (friendIndex === -1) {
            return response_codes_1.default.notFound(res, "Friend is not in the user's friend list.");
        }
        user.friends.splice(friendIndex, 1);
        // Remove user ID from friend's friend list
        const userIndex = friend.friends.indexOf(uid);
        if (userIndex === -1) {
            return response_codes_1.default.notFound(res, "User is not in the friend's friend list.");
        }
        friend.friends.splice(userIndex, 1);
        // all right, save it
        yield user.save();
        yield friend.save();
        return response_codes_1.default.noContent(res);
    }
    catch (error) {
        console.error("Error removing friend:", error);
        return response_codes_1.default.internalServerError(res, "An error occurred while removing the friend.");
    }
});
exports.removeFriend = removeFriend;
