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
const User_1 = __importDefault(require("../../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_codes_1 = __importDefault(require("../../utils/response-codes"));
const ACCESS_TOKEN_EXP = 1000 * 60 * 15;
const REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 7;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Validate required feilds
        if (!username || !password) {
            return response_codes_1.default.badRequest(res, "All feilds required");
        }
        // console.log("username : ", username);
        // console.log("password : ", password);
        // Find user by username
        const user = yield User_1.default.findOne({ username }).exec();
        // console.log("user : ", user);
        if (!user) {
            return response_codes_1.default.badRequest(res, "Invalid username or password");
        }
        // Compare password using bcrypt
        const isPasswordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordMatch) {
            return response_codes_1.default.badRequest(res, "Invalid username or password");
        }
        // Login Successfull
        const userDetails = yield User_1.default.findOne({ username })
            .select("-password")
            .exec();
        const accessToken = jsonwebtoken_1.default.sign({ _id: userDetails._id }, process.env.JWT_SECRET, {
            expiresIn: ACCESS_TOKEN_EXP,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ _id: userDetails._id }, process.env.JWT_SECRET, {
            expiresIn: REFRESH_TOKEN_EXP,
        });
        // userDetails.access_token = accessToken;
        // userDetails.access_token_expiry = "15m";
        // userDetails.refresh_token = refreshToken;
        // userDetails.refresh_token_expiry = "7d";
        yield userDetails.save();
        res.cookie("access-token", accessToken, {
            httpOnly: true,
            maxAge: ACCESS_TOKEN_EXP,
        });
        res.cookie("refresh-token", refreshToken, {
            httpOnly: true,
            maxAge: REFRESH_TOKEN_EXP,
        });
        response_codes_1.default.success(res, userDetails, "Login Succcessful");
    }
    catch (error) {
        console.error(error);
        response_codes_1.default.internalServerError(res, "Login Failed");
    }
});
exports.login = login;
