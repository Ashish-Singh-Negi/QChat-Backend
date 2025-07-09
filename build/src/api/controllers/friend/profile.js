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
exports.getFriendDetails = void 0;
const response_codes_1 = __importDefault(require("../../../utils/response-codes"));
const User_1 = __importDefault(require("../../../models/User"));
const friend_1 = __importDefault(require("../../../services/friend"));
const FirendRepository_1 = __importDefault(require("../../../repositories/FirendRepository"));
const getFriendDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fid } = req.params;
        const friendServiceInstance = new friend_1.default(new FirendRepository_1.default(User_1.default));
        const { friendProfile } = yield friendServiceInstance.getFriendProfile(fid);
        return response_codes_1.default.success(res, friendProfile, "F Profile Found");
    }
    catch (error) {
        console.error(error);
        return response_codes_1.default.internalServerError(res, "Internal Server Error :(");
    }
});
exports.getFriendDetails = getFriendDetails;
