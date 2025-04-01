import { Router } from "express";

import { login as loginController } from "../controllers/Auth/login";
import { register as registerController } from "../controllers/Auth/register";
import { refresh } from "../controllers/Auth/refresh";

const router = Router();

router.post(`/user/login`, loginController);
router.post("/user/register", registerController);
router.post("/user/refresh", refresh);

export default router;
