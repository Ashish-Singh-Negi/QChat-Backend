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

interface MessageData {
  action:
    | "JOIN"
    | "CHAT_MESSAGE"
    | "LEAVE"
    | "UPDATE"
    | "ONLINE_STATUS_HEARTBEAT"
    | "CHECK_ONLINE_STATUS"
    | "OFFLINE_STATUS";
  content: string;
  chatId?: string;
  sender?: string;
  receiver?: string;
}

// Create a WebSocket server
const wss = new WebSocketServer({ server, path: "/chat" });

// Object to store rooms and their clients
// const rooms: { [key: string]: WebSocket } = {};

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
      const data: MessageData = JSON.parse(message.toString());

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
                JSON.stringify({ action: data.action, sender: data.sender })
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
          if (data.sender && data.receiver && data.chatId && data.content) {
            const content = data.content.trim();

            const isoTimeFormatOfMessageSendAt = new Date().toISOString();
            const messageId = new ObjectId();

            messageServiceInstance.storeMessage(
              messageId,
              data.sender,
              data.receiver,
              content,
              data.chatId
            );

            const receiver = onlineUsers.get(data.receiver);
            if (receiver)
              receiver?.send(
                JSON.stringify({
                  action: "CHAT_MESSAGE",
                  _id: messageId,
                  sender: data.sender,
                  receiver: data.receiver,
                  content: content,
                  createdAt: isoTimeFormatOfMessageSendAt,
                })
              );

            ws.send(
              JSON.stringify({
                action: "CHAT_MESSAGE",
                _id: messageId,
                sender: data.sender,
                receiver: data.receiver,
                content: content,
                createdAt: isoTimeFormatOfMessageSendAt,
              })
            );
          }
          break;

        default:
          console.log("Unknown action:", data.action);
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

// case "JOIN":
//   if (data.room) {
//     if (!rooms[data.room]) {
//       // create new room
//       rooms[data.room] = new Set();
//     }

//     // check if client already exits in room
//     if (rooms[data.room].has(ws)) {
//       console.log(" Client already exist : ) in ROOM : ", data.room);
//       break;
//     }

//     rooms[data.room].add(ws);
//     ws.room = data.room; // Track the client's room

// rooms[data.room].forEach((client) => {
//   if (client != ws && client.readyState === WebSocket.OPEN) {
//     client.send(
//       JSON.stringify({
//         isOnline: true,
//       })
//     );
//   }
// });

//     console.log(`>> Client joined room: ${data.room}`);
//     console.log(">> ROOMS : >> ", rooms[0]);
//   }
//   break;

// case "UPDATE":
//   if (data.room) {
//     const room = rooms[data.room];

//     if (room) {
//       room.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//           client.send(
//             JSON.stringify({
//               sender: null,
//               receiver: null,
//               content: "UPDATE",
//               roomId: data.room,
//             })
//           );
//         }
//       });
//     }
//   }

// case "MESSAGE":
//   if (data.room && data.content) {
//     const room = rooms[data.room];
//     if (room) {
//       const mid = new ObjectId();

//       messageServiceInstance.storeMessage(
//         mid,
//         data.sender!,
//         data.receiver!,
//         data.content!,
//         data.room!
//       );

//       room.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//           client.send(
//             JSON.stringify({
//               _id: mid,
//               sender: data.sender,
//               receiver: data.receiver,
//               content: data.content,
//               createdAt: new Date().toISOString(),
//             })
//           );
//         }
//       });
//     }
//     console.log("message : ", data.content);
//   }
//   break;

// case "LEAVE":
//   if (ws.room && rooms[ws.room]) {
//     rooms[ws.room].delete(ws);
//     if (rooms[ws.room].size === 0) {
//       delete rooms[ws.room];
//     }
//     console.log(`>> Client left room: ${ws.room}`);
//     ws.room = undefined;
//   }
//   break;

// Remove client from its room on disconnect
// if (ws.room && rooms[ws.room]) {
//   rooms[ws.room].delete(ws);
//   if (rooms[ws.room].size === 0) {
//     delete rooms[ws.room];
//   }
//   console.log(`Client disconnected and left room: ${ws.room}`);
// }
