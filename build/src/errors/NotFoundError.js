"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CustomError_1 = require("./CustomError");
class NotFoundError extends CustomError_1.CustomError {
    constructor(params) {
        const { code, message, logging } = params || {};
        super(message || "Not Found");
        this._code = code || NotFoundError._statusCode;
        this._logging = logging || false;
        this._context = (params === null || params === void 0 ? void 0 : params.context) || {};
        // Only because we are extending a built in class
        Object.setPrototypeOf(this, NotFoundError.prototype);
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
NotFoundError._statusCode = 404;
exports.default = NotFoundError;
