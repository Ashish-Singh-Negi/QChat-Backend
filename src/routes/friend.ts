import { Router } from "express";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  sendFriendRequest,
} from "../controllers/Friend/request";
import { removeFriend } from "../controllers/Friend/remove";
import { inviteToChatRoom } from "../controllers/Friend/invite";

const router = Router();

router.patch("/friends/request", sendFriendRequest);
router.patch("/friends/:fid/accept", acceptFriendRequest);
router.patch("/friends/:fid/reject", rejectFriendRequest);

// Remove user from friend list
router.patch("/friends/:fid/remove", removeFriend);

router.patch("/friends/:fid/chats/:crid/invite", inviteToChatRoom);
// router.patch("/friends/:fid/chats/:crid/invite/reject");

export default router;
