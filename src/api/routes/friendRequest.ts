import { Router } from "express";
import {
  acceptFriendRequest,
  getFriendRequest,
  rejectFriendRequest,
  sendFriendRequest,
} from "../controllers/friend/request";

const router = Router();

router.get("/:rid", getFriendRequest);
router.post("/", sendFriendRequest);

router.patch("/:rid/accept", acceptFriendRequest);
router.patch("/:rid/reject", rejectFriendRequest);

export default router;
