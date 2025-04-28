"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const response_codes_1 = __importDefault(require("../../utils/response-codes"));
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const User_1 = __importDefault(require("../../models/User"));
const ACCESS_TOKEN_EXP = 1000 * 60 * 15;
const REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 7;
const refresh = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refresh = req.cookies["refresh-token"];
        console.log("REFRESH : ", refresh);
        if (!refresh)
            return response_codes_1.default.redirect(res, "/login", "unauthorized");
        const jwtPayload = (0, jsonwebtoken_1.verify)(refresh, process.env.JWT_SECRET);
        const user = yield User_1.default.findById(jwtPayload._id).select("-password").exec();
        if (!user)
            return response_codes_1.default.redirect(res, "/login", "User Not found");
        const accessToken = yield jsonwebtoken_1.default.sign({
            _id: user._id,
        }, process.env.JWT_SECRET, {
            expiresIn: ACCESS_TOKEN_EXP,
        });
        const refreshToken = yield jsonwebtoken_1.default.sign({
            _id: user._id,
        }, process.env.JWT_SECRET, {
            expiresIn: REFRESH_TOKEN_EXP,
        });
        user.access_token = accessToken;
        user.refresh_token = refreshToken;
        yield user.save();
        res.cookie("access-token", accessToken, {
            httpOnly: true,
            maxAge: ACCESS_TOKEN_EXP,
        });
        res.cookie("refresh-token", refreshToken, {
            httpOnly: true,
            maxAge: REFRESH_TOKEN_EXP,
        });
        return response_codes_1.default.created(res, {
            message: "New Tokens Created",
        }, "Token Refreshed");
    }
    catch (error) {
        console.error(error);
    }
});
exports.refresh = refresh;
