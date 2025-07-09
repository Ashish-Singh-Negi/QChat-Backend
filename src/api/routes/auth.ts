import { Router } from "express";

import { login as loginController } from "../controllers/auth/login";
import { register as registerController } from "../controllers/auth/register";
import { refresh as refreshController } from "../controllers/auth/refresh";

export const router = Router();

router.post(`/login`, loginController);
router.post("/register", registerController);
router.post("/refresh", refreshController);

export default router;
