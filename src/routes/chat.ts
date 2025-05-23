import { Router } from "express";
import {
  createChatRoom,
  deleteChatRoom,
  getChatRoomDetails,
  updateChatRoomSettings,
} from "../controllers/Chat/chat";

const router = Router();

router.get("/chats/:crid", getChatRoomDetails);
router.post("/chats", createChatRoom);
router.patch("/chats/:crid", updateChatRoomSettings);
router.delete("/chats/:crid", deleteChatRoom);

export default router;
