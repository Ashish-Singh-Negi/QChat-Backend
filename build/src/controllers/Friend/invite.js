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
exports.inviteToChatRoom = void 0;
const response_codes_1 = __importDefault(require("../../utils/response-codes"));
const User_1 = __importDefault(require("../../models/User"));
const inviteToChatRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fid, crid } = req.params;
        const uid = req.uid;
        console.log(fid, " & ", crid);
        if (!fid || !crid)
            return response_codes_1.default.badRequest(res, "Friend Id & chat room Id is required");
        const friend = yield User_1.default.findById(fid).select("-password");
        return response_codes_1.default.success(res, {}, "Invite send successfully");
    }
    catch (error) {
        console.error(error);
        return response_codes_1.default.internalServerError(res, "An error occurred");
    }
});
exports.inviteToChatRoom = inviteToChatRoom;
