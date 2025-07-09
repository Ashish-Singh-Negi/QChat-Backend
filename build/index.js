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
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./src/api/routes"));
const config_1 = __importDefault(require("./src/config"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const ws_1 = require("ws");
const ws_2 = require("ws");
const errorhandler_1 = require("./src/middlewares/errorhandler");
const message_1 = __importDefault(require("./src/services/message"));
const MessageRepository_1 = __importDefault(require("./src/repositories/MessageRepository"));
const ChatRepository_1 = __importDefault(require("./src/repositories/ChatRepository"));
const Chat_1 = __importDefault(require("./src/models/Chat"));
const Message_1 = __importDefault(require("./src/models/Message"));
const mongodb_1 = require("mongodb");
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
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(config_1.default.api.prefix, routes_1.default);
app.use(errorhandler_1.errorHandler);
// Create a WebSocket server
const wss = new ws_2.WebSocketServer({ server, path: "/chat" });
// Object to store rooms and their clients
const rooms = {};
wss.on("connection", (ws) => {
    console.log("New Ws connected");
    const messageServiceInstance = new message_1.default(new MessageRepository_1.default(Message_1.default), new ChatRepository_1.default(Chat_1.default));
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
                            const mid = new mongodb_1.ObjectId();
                            messageServiceInstance.storeMessage(mid, data.sender, data.receiver, data.content, data.room);
                            room.forEach((client) => {
                                if (client.readyState === ws_1.WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        _id: mid,
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
