"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpStatus = {
    // Informational responses
    informational: (res, message) => {
        res.status(100).json({ message });
    },
    // Success responses
    success: (res, data, message) => {
        res.status(200).json({
            data,
            message,
        });
    },
    created: (res, data, message) => {
        res.status(201).json({
            data,
            message,
        });
    },
    noContent: (res) => {
        res.sendStatus(204);
    },
    // Redirection messages
    redirect: (res, url, message) => {
        res.status(302).json({ message, redirectUrl: url });
    },
    // Client error responses
    badRequest: (res, message) => {
        res.status(400).json({ error: message });
    },
    notFound: (res, message) => {
        res.status(404).json({ error: message });
    },
    forbidden: (res, message) => {
        res.status(403).json({ error: message });
    },
    // Server error responses
    internalServerError: (res, message) => {
        console.error(message); // Log the error for debugging
        res.status(500).json({ error: "Internal Server Error", message });
    },
    serviceUnavailable: (res, message) => {
        res.status(503).json({ error: message });
    },
    // Added Conflict response
    conflict: (res, message) => {
        res.status(409).json({ error: message });
    },
};
exports.default = httpStatus;
