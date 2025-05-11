"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const request_1 = require("../controllers/Friend/request");
const remove_1 = require("../controllers/Friend/remove");
const invite_1 = require("../controllers/Friend/invite");
const router = (0, express_1.Router)();
router.patch("/friends/request", request_1.sendFriendRequest);
router.patch("/friends/:fid/accept", request_1.acceptFriendRequest);
router.patch("/friends/:fid/reject", request_1.rejectFriendRequest);
// Remove user from friend list
router.patch("/friends/:fid/remove", remove_1.removeFriend);
router.patch("/friends/:fid/chats/:crid/invite", invite_1.inviteToChatRoom);
// router.patch("/friends/:fid/chats/:crid/invite/reject");
exports.default = router;
