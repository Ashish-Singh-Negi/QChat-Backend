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
exports.searchUser = void 0;
const response_codes_1 = __importDefault(require("../../../utils/response-codes"));
const User_1 = __importDefault(require("../../../models/User"));
const user_1 = __importDefault(require("../../../services/user"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const UserRepository_1 = __importDefault(require("../../../repositories/UserRepository"));
const searchUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.query;
    if (!username)
        return response_codes_1.default.badRequest(res, "username is required");
    const userServiceinstance = new user_1.default(new UserRepository_1.default(User_1.default));
    const { usernames } = yield userServiceinstance.searchWithUsername(username);
    console.log(usernames);
    return response_codes_1.default.success(res, usernames, "Founded");
}));
exports.searchUser = searchUser;
