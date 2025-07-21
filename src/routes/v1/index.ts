import express from "express";

import authRoute from "./auth";
import messageRoute from "./message";
import friendRoute from "./friend";
import friendRequestRoute from "./friendRequest";
import chatRoute from "./chat";
import userRoute from "./user";
import { verifyUser } from "../../middlewares";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/messages", messageRoute);

router.use(verifyUser);

router.use("/friends", friendRoute);
router.use("/friends/requests", friendRequestRoute);
router.use("/chats", chatRoute);
router.use("/users", userRoute);

export default router;
