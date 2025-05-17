import { Router } from "express";
import {
  getChatRoomDetails,
  updateChatRoomSettings,
} from "../controllers/Chat/chatInfo";

const router = Router();

router.get("/chats/:crid", getChatRoomDetails);
router.patch("/chats/:crid", updateChatRoomSettings);

export default router;
