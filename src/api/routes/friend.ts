import { Router } from "express";
import { removeFriend } from "../controllers/friend/remove";
import { inviteToChatRoom } from "../controllers/friend/invite";
import { getFriendDetails } from "../controllers/friend/profile";

const router = Router();

router.get("/:fid", getFriendDetails);

// Remove user from friend list
router.patch("/:fid/remove", removeFriend);

router.patch("/:fid/chats/:crid/invite", inviteToChatRoom);
// router.patch("/friends/:fid/chats/:crid/invite/reject");

export default router;
