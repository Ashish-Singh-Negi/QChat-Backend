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
Object.defineProperty(exports, "__esModule", { value: true });
class UserService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    getUserById(userId, filter) {
        return this.userRepo.findUserById(userId, filter);
    }
    getUserProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRecord = yield this.userRepo.findUserById(userId, "-password");
            return { userProfile: userRecord };
        });
    }
    updateUserProfile(userId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRecord = yield this.userRepo.findUserById(userId);
            if (dto.about)
                userRecord.about = dto.about;
            if (dto.profilePic)
                userRecord.profilePic = dto.profilePic;
            const updatedUserProfile = yield userRecord.save();
            return { updatedUserProfile };
        });
    }
    searchWithUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRecords = yield this.userRepo.getAllUser("username");
            const usernames = userRecords.filter((userRecord) => userRecord.username.toLowerCase().startsWith(username.toLowerCase()));
            return { usernames };
        });
    }
}
exports.default = UserService;
