import { Router } from "express";

import { signinController } from "../../controllers/auth/signin";
import { signupController } from "../../controllers/auth/signup";
import { refreshController } from "../../controllers/auth/refresh";

import { validateRequestBody } from "../../validators";
import { signupSchema } from "../../validators/signup.validator";
import { signinSchema } from "../../validators/signin.validator";

export const router = Router();

// POST  /api/v1/auth/signin
router.post(`/signin`, validateRequestBody(signinSchema), signinController);

// POST  /api/v1/auth/signup
router.post("/signup", validateRequestBody(signupSchema), signupController);

// POST  /api/v1/auth/refresh
router.post("/refresh", refreshController);

export default router;
