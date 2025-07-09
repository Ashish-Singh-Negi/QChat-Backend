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
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
class FriendService {
    constructor(friendRepo) {
        this.friendRepo = friendRepo;
    }
    getFriendProfile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const friendRecord = yield this.friendRepo.findfriendById(id, "-updatedAt");
            if (!friendRecord)
                throw new NotFoundError_1.default({
                    message: "Friend Profile Not Found",
                });
            return { friendProfile: friendRecord };
        });
    }
    removeFriend(userId, friendId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(userId, " ", friendId);
        });
    }
}
exports.default = FriendService;
