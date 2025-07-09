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
exports.login = void 0;
const response_codes_1 = __importDefault(require("../../../utils/response-codes"));
const User_1 = __importDefault(require("../../../models/User"));
const auth_1 = __importDefault(require("../../../services/auth"));
const BadRequestError_1 = __importDefault(require("../../../errors/BadRequestError"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const UserRepository_1 = __importDefault(require("../../../repositories/UserRepository"));
const ACCESS_TOKEN_EXP = 1000 * 60 * 15;
const REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 7;
const login = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // Validate required feilds
    if (!username || !password) {
        throw new BadRequestError_1.default({
            message: "username and password is required",
        });
    }
    const authServiceInstance = new auth_1.default(new UserRepository_1.default(User_1.default));
    const { user, access_token, refresh_token } = yield authServiceInstance.SignIn(username, password);
    res.cookie("access-token", access_token, {
        httpOnly: true,
        maxAge: ACCESS_TOKEN_EXP,
        sameSite: "none",
        secure: true,
    });
    res.cookie("refresh-token", refresh_token, {
        httpOnly: true,
        maxAge: REFRESH_TOKEN_EXP,
        sameSite: "none",
        secure: true,
    });
    return response_codes_1.default.success(res, user, "Login Succcessful");
}));
exports.login = login;
