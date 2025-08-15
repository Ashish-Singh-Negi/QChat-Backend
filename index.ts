import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectToDB from "./src/utils/dbconnection";

import { WebSocket } from "ws";
import { WebSocketServer } from "ws";

import apiRoutes from "./src/routes";
import config from "./src/config";

import Message from "./src/models/Message";

import { errorHandler } from "./src/middlewares/errorhandler";

import MessageService from "./src/services/message";

import MessageRepository from "./src/repositories/MessageRepository";
import ChatRepository from "./src/repositories/ChatRepository";

import Chat from "./src/models/Chat";

import { ObjectId } from "mongodb";

const app: express.Application = express();

// Create an HTTP Server
const server = http.createServer(app);

// connect to DB
(async () => {
  try {
    await connectToDB();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

// TODO config CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use(config.api.prefix, apiRoutes);

app.use(errorHandler);

interface SendMessage {
  action: "CHAT_MESSAGE";
  content: string;
  chatId: string;
  sender: string;
  receiver: string;
}

interface OnlineStatusHeartbeat {
  action: "ONLINE_STATUS_HEARTBEAT";
  sender: string;
}

interface CheckUserOnlineStatus {
  action: "CHECK_ONLINE_STATUS";
  receiver: string;
}

interface AckMessage {
  action: "MESSAGE_DELIVERED_ACKNOWLEDGEMENT";
  _id: string;
  sender: string;
  chatId: string;
}

interface RoomMessage {
  action: "ROOM_MESSAGE";
  content: string;
}

// Create a WebSocket server
const wss = new WebSocketServer({ server, path: "/chat" });

const onlineUsers = new Map<string, WebSocket>();
const trackOnlineStateOfUsers = new Map<string, { lastSeen: number }>();

setInterval(() => {
  console.log("\n ----------------------------  Check if user disconneted \n");

  trackOnlineStateOfUsers.forEach((online, userId) => {
    if (Date.now() - online.lastSeen > 10000) {
      onlineUsers.delete(userId);
      trackOnlineStateOfUsers.delete(userId);
    }
  });

  console.log(" Online users : ", onlineUsers.size);
  console.log(" Online users track : ", trackOnlineStateOfUsers.size);
}, 15000);

wss.on("connection", (ws: WebSocket) => {
  console.log("New Ws connected");

  const messageServiceInstance = new MessageService(
    new MessageRepository(Message),
    new ChatRepository(Chat)
  );

  ws.on("message", (message) => {
    try {
      const data:
        | SendMessage
        | AckMessage
        | OnlineStatusHeartbeat
        | CheckUserOnlineStatus = JSON.parse(message.toString());

      console.log("Data ", data);

      switch (data.action) {
        case "ONLINE_STATUS_HEARTBEAT":
          console.log(" *** ONLINE_STATUS_HEARTBEAT *** ");
          console.log(" >> Online users :  ", onlineUsers.size);

          trackOnlineStateOfUsers.set(data.sender!, {
            lastSeen: Date.now(),
          });

          if (onlineUsers.has(data.sender!)) return;
          onlineUsers.set(data.sender!, ws);

          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  action: data.action,
                  sender: data.sender,
                  isOnline: true,
                })
              );
            }
          });
          break;

        case "CHECK_ONLINE_STATUS":
          ws.send(
            JSON.stringify({
              action: data.action,
              receiver: data.receiver,
              isOnline: onlineUsers.has(data.receiver!),
            })
          );
          break;

        case "CHAT_MESSAGE":
          if (
            data.sender &&
            data.receiver &&
            data.chatId &&
            data.content.trim()
          ) {
            const content = data.content.trim();
            if (!content) break;

            try {
              const messageId = new ObjectId();
              const createdAt = new Date().toISOString();

              const payload = {
                action: "CHAT_MESSAGE",
                _id: messageId,
                sender: data.sender,
                receiver: data.receiver,
                chatId: data.chatId,
                content,
                createdAt,
              };

              const receiverSocket = onlineUsers.get(data.receiver);
              if (receiverSocket) receiverSocket?.send(JSON.stringify(payload));

              // TODO implement Message notification if user is offline

              const status = receiverSocket ? "DELIVERED" : "SEND";
              messageServiceInstance.storeMessage(
                messageId,
                data.sender,
                data.receiver,
                content,
                data.chatId,
                status
              );

              ws.send(JSON.stringify({ ...payload, status: "SEND" })); // echo back to sender
            } catch (err) {
              console.error("CHAT_MESSAGE error:", err);
              ws.send(
                JSON.stringify({
                  action: "ERROR",
                  message: "Message failed to send.",
                })
              );
            }
          }
          break;

        case "MESSAGE_DELIVERED_ACKNOWLEDGEMENT":
          if (data.sender) {
            const senderSocket = onlineUsers.get(data.sender);

            if (!senderSocket)
              messageServiceInstance.updateMessageStatus(data._id, "DELIVERED");

            if (senderSocket)
              senderSocket?.send(
                JSON.stringify({
                  action: "MESSAGE_DELIVERED_ACKNOWLEDGEMENT",
                  _id: data._id,
                  status: "DELIVERED",
                  chatId: data.chatId,
                })
              );
          }
          break;

        default:
          console.log("Unknown action:", data);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log(` !!!!!! Client disconnected \n`);
    console.log(" Online Users : ", onlineUsers);
    for (const [userId, socket] of onlineUsers.entries()) {
      if (socket === ws) {
        onlineUsers.delete(userId);
        trackOnlineStateOfUsers.delete(userId);
        console.log(`User ${userId} disconnected (WebSocket closed).`);
        break;
      }
    }
  });
});

// Start the HTTP Server
const PORT = 3000;

server.listen(PORT, () => {
  console.log(`API Server listening at http://localhost:${PORT}`);
  console.log(`Websocket endpoint listening at ws://localhost:${PORT}/chat`);
});
