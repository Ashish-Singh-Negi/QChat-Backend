import { Router } from "express";
import {
  createChat,
  deleteChat,
  disappearChatMessages,
  getChatDetails,
  updateChatSettings,
} from "../controllers/chat/chat";

import {
  // deleteChatMessages,
  getAllMessages,
} from "../controllers/chat/message";

const router = Router();

router.get("/:crid/messages", getAllMessages);
// router.delete("/:crid/messages", deleteChatMessages);

router.delete("/:crid/messages/disappear", disappearChatMessages);

router.get("/:crid", getChatDetails);
router.post("/", createChat);
router.patch("/:crid", updateChatSettings);
router.delete("/:crid", deleteChat);

export default router;
