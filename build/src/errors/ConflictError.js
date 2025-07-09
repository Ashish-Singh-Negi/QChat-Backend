"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CustomError_1 = require("./CustomError");
class ConflictError extends CustomError_1.CustomError {
    constructor(params) {
        const { code, message, logging } = params || {};
        super(message || "Conflict");
        this._code = code || ConflictError._statusCode;
        this._logging = logging || false;
        this._context = (params === null || params === void 0 ? void 0 : params.context) || {};
        // Only because we are extending a built in class
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
    get errors() {
        return { message: this.message, context: this._context };
    }
    get statusCode() {
        return this._code;
    }
    get logging() {
        return this._logging;
    }
}
ConflictError._statusCode = 409;
exports.default = ConflictError;
