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
exports.refresh = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../../../models/User"));
const config_1 = __importDefault(require("../../../config"));
const auth_1 = __importDefault(require("../../../services/auth"));
const response_codes_1 = __importDefault(require("../../../utils/response-codes"));
const UserRepository_1 = __importDefault(require("../../../repositories/UserRepository"));
const ACCESS_TOKEN_EXP = 1000 * 60 * 15;
const REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 7;
const refresh = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refresh = req.cookies["refresh-token"];
    if (!refresh)
        return response_codes_1.default.redirect(res, "/signin", "unauthorized");
    let jwtPayload;
    try {
        jwtPayload = (0, jsonwebtoken_1.verify)(refresh, config_1.default.jwtSecret);
    }
    catch (error) {
        return response_codes_1.default.redirect(res, "/signin", "User Not found");
    }
    const authServiceInstance = new auth_1.default(new UserRepository_1.default(User_1.default));
    const { access_token, refresh_token } = authServiceInstance.refreshToken({
        _id: jwtPayload._id,
        username: jwtPayload.name,
    });
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
    return response_codes_1.default.created(res, {
        message: "New Tokens Created",
    }, "Token Refreshed");
}));
exports.refresh = refresh;
