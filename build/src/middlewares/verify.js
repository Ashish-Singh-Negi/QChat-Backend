"use strict";
/// <reference path="../../express.d.ts" />
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
exports.verify = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies["access-token"];
        if (!token) {
            res.status(401).json({
                error: "unauthorized",
            });
        }
        const isValid = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!isValid) {
            res.status(401).json({
                error: "Invalid token",
            });
        }
        req.uid = isValid._id;
        req.name = isValid.name;
        next();
    }
    catch (error) {
        console.error(error);
    }
});
exports.verify = verify;
