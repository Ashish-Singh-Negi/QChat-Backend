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
const express_1 = __importDefault(require("express"));
const dbconnection_1 = __importDefault(require("./src/utils/dbconnection"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const ws_1 = require("ws");
const app = (0, express_1.default)();
// Create an HTTP Server
const server = http_1.default.createServer(app);
dotenv_1.default.config();
// connect to DB
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, dbconnection_1.default)();
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}))();
// TODO: Config CORS
app.use((0, cors_1.default)({
    origin: "http://localhost:3001",
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// Import all Routes
const verify_1 = require("./src/middleware/verify");
const auth_1 = __importDefault(require("./src/routes/auth"));
const friend_1 = __importDefault(require("./src/routes/friend"));
const message_1 = __importDefault(require("./src/routes/message"));
app.use("/auth", auth_1.default);
app.use("/users/chat", message_1.default);
app.use(verify_1.verify);
app.use("/users", friend_1.default);
app.get("/users/profile", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.url);
        const uid = req.uid;
        console.log(req.query);
        console.log("Params : ", req.params);
        console.log(uid);
        const userProfile = yield User_1.default.findById(uid).select("-password").exec();
        if (!userProfile)
            return response_codes_1.default.redirect(res, "/login", "Unauthorized");
        return response_codes_1.default.success(res, userProfile, "Profile Found");
    }
    catch (error) {
        console.error(error);
        return response_codes_1.default.internalServerError(res, "Internal Server Error :(");
    }
}));
app.get("/users/friends", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fid = req.query.fid;
        const friendProfile = yield User_1.default.findById(fid).select("-password").exec();
        if (!friendProfile)
            return response_codes_1.default.redirect(res, "/login", "Unauthorized");
        return response_codes_1.default.success(res, friendProfile, "F Profile Found");
    }
    catch (error) {
        console.error(error);
        return response_codes_1.default.internalServerError(res, "Internal Server Error :(");
    }
}));
const ws_2 = require("ws");
const User_1 = __importDefault(require("./src/models/User"));
const response_codes_1 = __importDefault(require("./src/utils/response-codes"));
const mongodb_1 = require("mongodb");
// Create a WebSocket server
const wss = new ws_2.WebSocketServer({ server, path: "/chat" });
// Object to store rooms and their clients
const rooms = {};
const storeMessage = (messageData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.post("http://localhost:3000/users/chat/messages", messageData, {
            withCredentials: true,
        });
        console.log("RESPONSE : ", data);
    }
    catch (error) {
        console.error("ERROR : ", error);
    }
});
wss.on("connection", (ws) => {
    console.log("New Ws connected");
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log("Data ", data);
            switch (data.action) {
                case "JOIN":
                    if (data.room) {
                        if (!rooms[data.room]) {
                            // create new room
                            rooms[data.room] = new Set();
                        }
                        // check if client already exits in room
                        if (rooms[data.room].has(ws)) {
                            console.log(" Client already exist : ) in ROOM : ", data.room);
                            break;
                        }
                        rooms[data.room].add(ws);
                        ws.room = data.room; // Track the client's room
                        // rooms[data.room].forEach((client) => {
                        //   if (client != ws && client.readyState === WebSocket.OPEN) {
                        //     client.send(
                        //       JSON.stringify({
                        //         isOnline: true,
                        //       })
                        //     );
                        //   }
                        // });
                        console.log(`>> Client joined room: ${data.room}`);
                        console.log(">> ROOMS : >> ", rooms);
                    }
                    break;
                case "UPDATE":
                    if (data.room) {
                        const room = rooms[data.room];
                        if (room) {
                            room.forEach((client) => {
                                if (client.readyState === ws_1.WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        sender: null,
                                        receiver: null,
                                        content: "UPDATE",
                                        roomId: data.room,
                                    }));
                                }
                            });
                        }
                    }
                case "MESSAGE":
                    if (data.room && data.content) {
                        const room = rooms[data.room];
                        if (room) {
                            const messageId = new mongodb_1.ObjectId();
                            storeMessage({
                                _id: messageId,
                                sender: data.sender,
                                receiver: data.receiver,
                                room: data.room,
                                content: data.content,
                            });
                            room.forEach((client) => {
                                if (client.readyState === ws_1.WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        _id: messageId,
                                        sender: data.sender,
                                        receiver: data.receiver,
                                        content: data.content,
                                        createdAt: new Date().toISOString(),
                                    }));
                                }
                            });
                        }
                        console.log("message : ", data.content);
                    }
                    break;
                case "LEAVE":
                    if (ws.room && rooms[ws.room]) {
                        rooms[ws.room].delete(ws);
                        if (rooms[ws.room].size === 0) {
                            delete rooms[ws.room];
                        }
                        console.log(`>> Client left room: ${ws.room}`);
                        ws.room = undefined;
                    }
                    break;
                default:
                    console.log("Unknown action:", data.action);
            }
        }
        catch (error) {
            console.error("Error processing message:", error);
        }
    });
    ws.on("close", () => {
        // Remove client from its room on disconnect
        if (ws.room && rooms[ws.room]) {
            rooms[ws.room].delete(ws);
            if (rooms[ws.room].size === 0) {
                delete rooms[ws.room];
            }
            console.log(`Client disconnected and left room: ${ws.room}`);
        }
    });
});
// Start the HTTP Server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`API Server listening at http://localhost:${PORT}`);
    console.log(`Websocket endpoint listening at ws://localhost:${PORT}/chat`);
});
