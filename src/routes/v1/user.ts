import { Router } from "express";
import {
  getProfile,
  updateProfile,
  updateUserChat,
} from "../../controllers/user/profile";
import { searchUser } from "../../controllers/user/search";
import { validateRequestBody } from "../../validators";
import { updateUserProfileSchema } from "../../validators/user.validator";

const router = Router();

// GET /api/v1/users
router.get("/", searchUser);

// GET /api/v1/users/profile
router.get("/profile", getProfile);

// TODO: GET /api/v1/users/:uid/profile

// PATCH /api/v1/users/profile
router.patch(
  "/profile",
  validateRequestBody(updateUserProfileSchema),
  updateProfile
);

// router.patch("/profile/chat/name", updateUserChat);

export default router;
