import { Router } from "express";
import { getProfile, updateProfile } from "../../controllers/user/profile";
import { searchUser } from "../../controllers/user/search";
import { validateRequestBody } from "../../utils/validators";
import { updateUserProfileSchema } from "../../utils/validators/user.validator";

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

export default router;
