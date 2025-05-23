import { Router } from "express";
import {
  acceptFriendRequest,
  getFriendRequest,
  rejectFriendRequest,
  sendFriendRequest,
} from "../controllers/Friend/request";
import { removeFriend } from "../controllers/Friend/remove";
import { inviteToChatRoom } from "../controllers/Friend/invite";

const router = Router();

router.get("/friends/requests/:rid", getFriendRequest);
router.post("/friends/requests", sendFriendRequest);

router.patch("/friends/requests/:rid/accept", acceptFriendRequest);
router.patch("/friends/requests/:rid/reject", rejectFriendRequest);

// Remove user from friend list
router.patch("/friends/:fid/remove", removeFriend);

router.patch("/friends/:fid/chats/:crid/invite", inviteToChatRoom);
// router.patch("/friends/:fid/chats/:crid/invite/reject");

export default router;
