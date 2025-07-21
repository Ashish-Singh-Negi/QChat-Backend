import { Router } from "express";
import { removeFriendController } from "../../controllers/friend/remove";
// import { inviteToChatRoom } from "../../controllers/friend/invite";
import { getFriendDetails } from "../../controllers/friend/profile";

const router = Router();

// GET  /api/v1/friends/:id
router.get("/:fid", getFriendDetails);

// PATCH  /api/v1/friends/:id/remove
router.patch("/:fid/remove", removeFriendController);

// PATCH  /api/v1/friends/:fid/
// router.patch("/:fid/chats/:crid/invite", inviteToChatRoom);
// router.patch("/friends/:fid/chats/:crid/invite/reject");

export default router;
