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

router.get("/:crid/messages", getMessages);
router.get("/messages/:mid", getMessage);
router.post("/messages", sendMessage);
router.patch("/messages", updateMessage);
router.delete("/:crid/messages", deleteChatMessages);

router.patch("/messages/:mid/deleteforeveryone", deleteMessageForEveryone);
router.patch("/messages/:mid/deleteforme", deleteMessageForMe);

export default router;
