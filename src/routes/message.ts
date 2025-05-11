import { Router } from "express";
import {
  deleteChatMessages,
  deleteMessageForEveryone,
  deleteMessageForMe,
  getMessage,
  getMessages,
  sendMessage,
  updateMessage,
} from "../controllers/Chat/message";

const router = Router();

router.get("/chats/:crid/messages", getMessages);
router.get("/chats/messages/:mid", getMessage);
router.post("/chats/messages", sendMessage);
router.patch("/chats/messages", updateMessage);
router.delete("/chats/:crid/messages", deleteChatMessages);

router.patch(
  "/chats/messages/:mid/deleteforeveryone",
  deleteMessageForEveryone
);
router.patch("/chats/messages/:mid/deleteforme", deleteMessageForMe);

export default router;
