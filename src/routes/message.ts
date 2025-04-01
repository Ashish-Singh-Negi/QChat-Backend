import { Router } from "express";
import {
  deleteChatMessages,
  deleteMessageForEveryone,
  deleteMessageForMe,
  getMessages,
  sendMessage,
  updateMessage,
} from "../controllers/Chat/message";

const router = Router();

router.get("/messages", getMessages);
router.post("/messages", sendMessage);
router.patch("/messages", updateMessage);
router.delete("/messages", deleteChatMessages);

router.patch("/messages/deleteforeveryone", deleteMessageForEveryone);
router.patch("/messages/deleteforme", deleteMessageForMe);

export default router;
