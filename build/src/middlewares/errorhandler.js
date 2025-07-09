"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const ConflictError_1 = __importDefault(require("../errors/ConflictError"));
const errorHandler = (err, req, res, next) => {
    // handled errors
    if (err instanceof BadRequestError_1.default) {
        const { statusCode, errors, logging } = err;
        if (logging) {
            console.error({
                code: err.statusCode,
                error: err.errors,
                stack: err.stack,
                endpoint: req.originalUrl,
                method: req.method,
                timestamp: new Date().toLocaleDateString(),
            });
        }
        res.status(statusCode).json({ errors });
    }
    if (err instanceof NotFoundError_1.default) {
        const { statusCode, errors, logging } = err;
        if (logging) {
            console.error({
                code: err.statusCode,
                error: err.errors,
                stack: err.stack,
                endpoint: req.originalUrl,
                method: req.method,
                timestamp: new Date().toLocaleDateString(),
            });
        }
        res.status(statusCode).json({ errors });
    }
    if (err instanceof ConflictError_1.default) {
        const { statusCode, errors, logging } = err;
        if (logging) {
            console.error({
                code: err.statusCode,
                error: err.errors,
                stack: err.stack,
                endpoint: req.originalUrl,
                method: req.method,
                timestamp: new Date().toLocaleDateString(),
            });
        }
        res.status(statusCode).json({ errors });
    }
    // unhandled error
    console.error("Unhandled error : ", JSON.stringify(err, null, 2));
    res.status(500).send({
        errors: [{ message: "Something went wrong." }],
    });
};
exports.errorHandler = errorHandler;
