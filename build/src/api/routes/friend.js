"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const remove_1 = require("../controllers/friend/remove");
const invite_1 = require("../controllers/friend/invite");
const profile_1 = require("../controllers/friend/profile");
const router = (0, express_1.Router)();
router.get("/:fid", profile_1.getFriendDetails);
// Remove user from friend list
router.patch("/:fid/remove", remove_1.removeFriend);
router.patch("/:fid/chats/:crid/invite", invite_1.inviteToChatRoom);
// router.patch("/friends/:fid/chats/:crid/invite/reject");
exports.default = router;
