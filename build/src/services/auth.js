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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const ConflictError_1 = __importDefault(require("../errors/ConflictError"));
const ACCESS_TOKEN_EXP = 1000 * 60 * 15;
const REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 7;
class AuthService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    Signup(userInputDTO) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(userInputDTO);
            try {
                const isUserAlreadyRegistered = yield this.userRepo.findOne({
                    username: userInputDTO.username,
                }, true);
                if (isUserAlreadyRegistered)
                    throw new ConflictError_1.default({ message: "User already Register" });
                console.log("hashing password");
                const hashPassword = yield bcrypt_1.default.hash(userInputDTO.password, 12);
                const userRecord = yield this.userRepo.createUser(Object.assign(Object.assign({}, userInputDTO), { password: hashPassword }));
                if (!userRecord)
                    throw new Error("User cannot be created!");
                const user = userRecord.toObject();
                Reflect.deleteProperty(user, "password");
                return { user };
            }
            catch (error) {
                throw error;
            }
        });
    }
    SignIn(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRecord = yield this.userRepo.findOne({
                    username: username,
                }, true);
                if (!userRecord)
                    throw new BadRequestError_1.default({
                        message: "User not registered",
                    });
                const isPasswordMatch = yield bcrypt_1.default.compare(password, userRecord.password);
                if (!isPasswordMatch)
                    throw new BadRequestError_1.default({ message: "Invalid credentials" });
                Reflect.deleteProperty(userRecord, "password");
                const access_token = this.generateAccessToken(userRecord);
                const refresh_token = this.generateRefreshToken(userRecord);
                return { user: userRecord, access_token, refresh_token };
            }
            catch (error) {
                throw error;
            }
        });
    }
    refreshToken(user) {
        const access_token = this.generateAccessToken(user);
        const refresh_token = this.generateRefreshToken(user);
        return { access_token, refresh_token };
    }
    generateAccessToken(user) {
        const access_token = jsonwebtoken_1.default.sign({
            _id: user._id,
            name: user.username,
        }, config_1.default.jwtSecret, {
            expiresIn: ACCESS_TOKEN_EXP,
        });
        return access_token;
    }
    generateRefreshToken(user) {
        const refresh_token = jsonwebtoken_1.default.sign({
            _id: user._id,
            name: user.username,
        }, config_1.default.jwtSecret, {
            expiresIn: REFRESH_TOKEN_EXP,
        });
        return refresh_token;
    }
}
exports.default = AuthService;
