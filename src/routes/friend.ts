import { Request, Response, Router } from "express";
import {
  acceptFriendRequest,
  rejectfriendRequest,
  sendFriendRequest,
} from "../controllers/Friend/request";
import { removeFriend } from "../controllers/Friend/remove";
import httpStatus from "../utils/response-codes";

const router = Router();

router.patch("/friends/request", sendFriendRequest);
router.patch("/friends/accept", acceptFriendRequest);
router.patch("/friends/reject", rejectfriendRequest);

// Remove user from friend list
router.patch("/friends/remove", removeFriend);

export default router;
