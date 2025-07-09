"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
process.env.NODE_ENV = process.env.NODE_ENV || "development";
const envFound = dotenv_1.default.config();
if (envFound.error) {
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
exports.default = {
    port: parseInt(process.env.PORT, 10),
    /**
     * Datebase URI
     */
    databaseURI: process.env.DATABASE_URI,
    /**
     * JWT secrets
     */
    jwtSecret: process.env.JWT_SECRET,
    /**
     * API configs
     */
    api: {
        prefix: "/api",
    },
};
