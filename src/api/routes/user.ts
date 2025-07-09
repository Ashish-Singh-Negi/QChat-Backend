import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/user/profile";
import { searchUser } from "../controllers/user/search";

const router = Router();

router.get("/", searchUser);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

export default router;
