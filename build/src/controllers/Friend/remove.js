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
const removeFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fid } = req.body;
        const uid = req.uid;
        if (!fid)
            return response_codes_1.default.badRequest(res, "Invalid FID");
        const user = yield User_1.default.findById(uid).select("-password");
        const index = user.friends.indexOf(fid);
        if (index === -1)
            return response_codes_1.default.notFound(res, "Already Removed");
        user.friends.splice(index, 1);
        yield user.save();
        return response_codes_1.default.success(res, user, "Friend Removed");
    }
    catch (error) {
        console.error(error);
        return response_codes_1.default.internalServerError(res, "Failed");
    }
});
exports.removeFriend = removeFriend;
