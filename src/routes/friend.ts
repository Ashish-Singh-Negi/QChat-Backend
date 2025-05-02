import { Request, Response, Router } from "express";
import {
  acceptFriendRequest,
  rejectfriendRequest,
  sendFriendRequest,
} from "../controllers/Friend/request";
import { removeFriend } from "../controllers/Friend/remove";

const router = Router();

router.patch("/friends/request", sendFriendRequest);
router.patch("/friends/:fid/accept", acceptFriendRequest);
router.patch("/friends/:fid/reject", rejectfriendRequest);

// Remove user from friend list
router.patch("/friends/remove", removeFriend);

export default router;
