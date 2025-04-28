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
const response_codes_1 = __importDefault(require("../../utils/response-codes"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../../models/User"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, confirmPassword } = req.body;
        console.log("register route");
        const usernameIs = username.trim();
        const emailIs = email.trim();
        const passwordIs = password.trim();
        const confirmPasswordIs = confirmPassword.trim();
        // validate required feilds
        if (!usernameIs || !emailIs || !passwordIs || !confirmPasswordIs) {
            return response_codes_1.default.badRequest(res, "missing required feilds");
        }
        // validate password and confirm password
        if (passwordIs !== confirmPasswordIs) {
            return response_codes_1.default.badRequest(res, "password and confirm password Not Matched");
        }
        const isUserRegisterd = yield User_1.default.findOne({ username: usernameIs })
            .select("-password")
            .lean()
            .exec();
        if (isUserRegisterd) {
            return response_codes_1.default.badRequest(res, "User already registerd");
        }
        const hashPassword = yield bcrypt_1.default.hash(passwordIs, 12);
        const user = yield User_1.default.create({
            username: usernameIs,
            email: emailIs,
            password: hashPassword,
        });
        if (!user) {
            return response_codes_1.default.internalServerError(res, "Registration Failed");
        }
        return response_codes_1.default.created(res, user, "Registered Succesfully");
    }
    catch (error) {
        console.error(error);
        return response_codes_1.default.internalServerError(res, "Registeration Failed");
    }
});
exports.register = register;
