import express from "express";
import connectToDB from "./src/utils/dbconnection";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./src/api/routes";
import config from "./src/config";
import cookieParser from "cookie-parser";
import { WebSocket } from "ws";
import { WebSocketServer } from "ws";
import { errorHandler } from "./src/middlewares/errorhandler";
import MessageService from "./src/services/message";
import MessageRepository from "./src/repositories/MessageRepository";
import ChatRepository from "./src/repositories/ChatRepository";
import Chat from "./src/models/Chat";
import Message from "./src/models/Message";
import { ObjectId } from "mongodb";

const app: express.Application = express();

// Create an HTTP Server
const server = http.createServer(app);

dotenv.config();

// connect to DB
(async () => {
  try {
    await connectToDB();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

// TODO: Config CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());

app.use(config.api.prefix, routes);

app.use(errorHandler);

// app.post("/user/friends/notifications", (req: Request, res: Response) => {
//   try {
//     const { notification } = req.body;

//     console.log("NOTIFICATION : ", notification);

//     return httpStatus.success(res, { notification }, "Notification");
//   } catch (error) {
//     console.error(error);
//     return httpStatus.internalServerError(
//       res,
//       "Notifications Internal Sever Error"
//     );
//   }
// });

interface MessageData {
  action: "JOIN" | "MESSAGE" | "LEAVE" | "UPDATE";
  content: string;
  room?: string;
  sender?: string;
  receiver?: string;
}

interface CustomWebSocket extends WebSocket {
  room?: string; // Add a custom property to track the room
}

// Create a WebSocket server
const wss = new WebSocketServer({ server, path: "/chat" });

// Object to store rooms and their clients
const rooms: { [key: string]: Set<CustomWebSocket> } = {};

wss.on("connection", (ws: CustomWebSocket) => {
  console.log("New Ws connected");

  const messageServiceInstance = new MessageService(
    new MessageRepository(Message),
    new ChatRepository(Chat)
  );

  ws.on("message", (message: WebSocket) => {
    try {
      const data: MessageData = JSON.parse(message.toString());

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
                if (client.readyState === WebSocket.OPEN) {
                  client.send(
                    JSON.stringify({
                      sender: null,
                      receiver: null,
                      content: "UPDATE",
                      roomId: data.room,
                    })
                  );
                }
              });
            }
          }

        case "MESSAGE":
          if (data.room && data.content) {
            const room = rooms[data.room];
            if (room) {
              const mid = new ObjectId();

              messageServiceInstance.storeMessage(
                mid,
                data.sender!,
                data.receiver!,
                data.content!,
                data.room!
              );

              room.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(
                    JSON.stringify({
                      _id: mid,
                      sender: data.sender,
                      receiver: data.receiver,
                      content: data.content,
                      createdAt: new Date().toISOString(),
                    })
                  );
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
    } catch (error) {
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
