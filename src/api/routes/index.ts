import express from "express";

import { verify } from "../../middlewares/verify";

import authRoute from "./auth";
import messageRoute from "./message";
import friendRoute from "./friend";
import friendRequestRoute from "./friendRequest";
import chatRoute from "./chat";
import userRoute from "./user";

const app = express();

app.use("/auth", authRoute);
app.use("/messages", messageRoute);

app.use(verify);

app.use("/friends", friendRoute);
app.use("/friends/requests", friendRequestRoute);
app.use("/chats", chatRoute);
app.use("/users", userRoute);

export default app;
