"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const request_1 = require("../controllers/Friend/request");
const remove_1 = require("../controllers/Friend/remove");
const router = (0, express_1.Router)();
router.patch("/friends/request", request_1.sendFriendRequest);
router.patch("/friends/accept", request_1.acceptFriendRequest);
router.patch("/friends/reject", request_1.rejectfriendRequest);
// Remove user from friend list
router.patch("/friends/remove", remove_1.removeFriend);
exports.default = router;
