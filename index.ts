import express, { NextFunction, Request, Response } from "express";
import connectToDB from "./src/utils/dbconnection";
import http from "http";
import dotenv from "dotenv";
import webSocket from "ws";
import axios from "axios";
import cors from "cors";
import cookieParser from "cookie-parser";
import { WebSocket } from "ws";

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

// Import all Routes
import { verify } from "./src/middleware/verify";
import authRouter from "./src/routes/auth";
import friendsRouter from "./src/routes/friend";
import messagesRouter from "./src/routes/message";

app.use("/auth", authRouter);
app.use("/users/chat", messagesRouter);

app.use(verify);

app.use("/users", friendsRouter);

app.get("/users/profile", async (req: Request, res: Response) => {
  try {
    console.log(req.url);

    const uid = req.uid;

    console.log(req.query);
    console.log("Params : ", req.params);

    console.log(uid);

    const userProfile = await User.findById(uid).select("-password").exec();

    if (!userProfile) return httpStatus.redirect(res, "/login", "Unauthorized");

    return httpStatus.success(res, userProfile, "Profile Found");
  } catch (error) {
    console.error(error);
    return httpStatus.internalServerError(res, "Internal Server Error :(");
  }
});

app.get("/users/friends", async (req: Request, res: Response) => {
  try {
    const fid = req.query.fid;

    const friendProfile = await User.findById(fid).select("-password").exec();

    if (!friendProfile)
      return httpStatus.redirect(res, "/login", "Unauthorized");

    return httpStatus.success(res, friendProfile, "F Profile Found");
  } catch (error) {
    console.error(error);
    return httpStatus.internalServerError(res, "Internal Server Error :(");
  }
});

import { WebSocketServer } from "ws";
import User from "./src/models/User";
import httpStatus from "./src/utils/response-codes";
import { ObjectId } from "mongodb";

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

const storeMessage = async (messageData: {
  _id: ObjectId;
  content: string;
  sender: string;
  receiver: string;
  room: string;
}) => {
  try {
    const { data } = await axios.post(
      "http://localhost:3000/users/chat/messages",
      messageData,
      {
        withCredentials: true,
      }
    );

    console.log("RESPONSE : ", data);
  } catch (error) {
    console.error("ERROR : ", error);
  }
};

wss.on("connection", (ws: CustomWebSocket) => {
  console.log("New Ws connected");

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
              const messageId = new ObjectId();

              storeMessage({
                _id: messageId,
                sender: data.sender!,
                receiver: data.receiver!,
                room: data.room,
                content: data.content,
              });

              room.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(
                    JSON.stringify({
                      _id: messageId,
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
