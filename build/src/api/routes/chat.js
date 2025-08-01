"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_1 = require("../controllers/chat/chat");
const message_1 = require("../controllers/chat/message");
const router = (0, express_1.Router)();
router.get("/:crid/messages", message_1.getAllMessages);
// router.delete("/:crid/messages", deleteChatMessages);
router.delete("/:crid/messages/disappear", chat_1.disappearChatMessages);
router.get("/:crid", chat_1.getChatDetails);
router.post("/", chat_1.createChat);
router.patch("/:crid", chat_1.updateChatSettings);
router.delete("/:crid/clear", chat_1.clearChat);
exports.default = router;
