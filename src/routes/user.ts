import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/User/profile";

const router = Router();

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

export default router;
