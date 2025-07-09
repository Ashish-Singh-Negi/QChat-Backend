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
exports.updateProfile = exports.getProfile = void 0;
const User_1 = __importDefault(require("../../../models/User"));
const response_codes_1 = __importDefault(require("../../../utils/response-codes"));
const user_1 = __importDefault(require("../../../services/user"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const BadRequestError_1 = __importDefault(require("../../../errors/BadRequestError"));
const UserRepository_1 = __importDefault(require("../../../repositories/UserRepository"));
const getProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.url);
    const { uid } = req;
    const userServiceinstance = new user_1.default(new UserRepository_1.default(User_1.default));
    const { userProfile } = yield userServiceinstance.getUserProfile(uid);
    return response_codes_1.default.success(res, userProfile, "Profile Found");
}));
exports.getProfile = getProfile;
const updateProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req;
    const { about, profilePic } = req.body;
    if (!about && !profilePic)
        throw new BadRequestError_1.default({
            message: "data is required to update profile",
        });
    const dto = {
        about,
        profilePic,
    };
    const userServiceinstance = new user_1.default(new UserRepository_1.default(User_1.default));
    const { updatedUserProfile } = yield userServiceinstance.updateUserProfile(uid, dto);
    return response_codes_1.default.success(res, updatedUserProfile, "Profile Updated successfully");
}));
exports.updateProfile = updateProfile;
