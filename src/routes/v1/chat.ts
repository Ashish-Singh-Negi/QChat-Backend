import { Router } from "express";
import {
  getChatMessages,
  clearChat,
  createChat,
  disappearChatMessages,
  getChatDetails,
  updateChatDisappearingMessagesDurationSetting,
} from "../../controllers/chat.controllers";
import { validateRequestBody } from "../../validators";
import {
  createChatSchema,
  updateChatDisappearingDurationSchema,
} from "../../validators/chat.validators";

const router = Router();

// GET  /api/v1/chats/:crid/messages?page=1
router.get("/:crid/messages", getChatMessages);

// GET  /api/v1/chats/:crid
router.get("/:crid", getChatDetails);

// POST  /api/v1/chats
router.post("/", validateRequestBody(createChatSchema), createChat);

// PATCH  /api/v1/chats/:id/disappearduration
router.patch(
  "/:crid/disappearduration",
  validateRequestBody(updateChatDisappearingDurationSchema),
  updateChatDisappearingMessagesDurationSetting
);

// DELETE  /api/v1/chats/:crid/messages/disappear
router.delete("/:crid/messages/disappear", disappearChatMessages);

// DELETE  /api/v1/chats/:id
router.delete("/:crid/clear", clearChat);

export default router;
