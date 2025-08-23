import { Router } from "express";
import {
  acceptFriendRequest,
  getFriendRequest,
  rejectFriendRequest,
  sendFriendRequest,
} from "../../controllers/friend-request.controllers";
import { validateRequestBody } from "../../validators";
import { sendFriendRequestSchema } from "../../validators/friendRequest.validator";

const router = Router();

// GET  /api/v1/friends/requests/:rid
router.get("/:rid", getFriendRequest);

// POST  /api/v1/friends/requests
router.post(
  "/",
  validateRequestBody(sendFriendRequestSchema),
  sendFriendRequest
);

// PATCH  /api/v1/friends/requests/:rid/accept
router.patch("/:rid/accept", acceptFriendRequest);

// PATCH  /api/v1/friends/requests/:rid/reject
router.patch("/:rid/reject", rejectFriendRequest);

export default router;
