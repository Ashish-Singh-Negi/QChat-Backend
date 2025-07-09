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
exports.register = void 0;
const response_codes_1 = __importDefault(require("../../../utils/response-codes"));
const User_1 = __importDefault(require("../../../models/User"));
const auth_1 = __importDefault(require("../../../services/auth"));
const BadRequestError_1 = __importDefault(require("../../../errors/BadRequestError"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const UserRepository_1 = __importDefault(require("../../../repositories/UserRepository"));
const register = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, confirmPassword } = req.body;
    const usernameIs = username.trim();
    const emailIs = email.trim();
    const passwordIs = password.trim();
    const confirmPasswordIs = confirmPassword.trim();
    // validate required feilds
    if (!usernameIs || !emailIs || !passwordIs || !confirmPasswordIs) {
        throw new BadRequestError_1.default({ message: "All feild are required" });
    }
    // validate password and confirm password
    if (passwordIs !== confirmPasswordIs) {
        throw new BadRequestError_1.default({
            message: "password not match",
            context: {
                endpoint: req.originalUrl,
                method: req.method,
                details: "password and confirm password must be same",
            },
        });
    }
    const authServiceIntance = new auth_1.default(new UserRepository_1.default(User_1.default));
    const { user } = yield authServiceIntance.Signup({
        username: usernameIs,
        email: emailIs,
        password: passwordIs,
    });
    return response_codes_1.default.created(res, user, "Registered Succesfully");
}));
exports.register = register;
