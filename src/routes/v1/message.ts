import { Router } from "express";
import {
  deleteMessageForEveryone,
  deleteMessageForMe,
  getMessage,
  updatePinMessage,
  editMessage,
  storeMessage,
} from "../../controllers/message.controllers";

import { validateRequestBody } from "../../utils/validators";
import {
  editMessageSchema,
  storeMessageSchema,
} from "../../utils/validators/message.validators";

const router = Router();

// GET /api/v1/messages/:mid
router.get("/:mid", getMessage);

// POST /api/v1/messages
router.post("/", validateRequestBody(storeMessageSchema), storeMessage);

// PATCH /api/v1/messages/:mid/pin
router.patch("/:mid/pin", updatePinMessage);

// PATCH /api/v1/messages/:mid/edit
router.patch("/:mid/edit", validateRequestBody(editMessageSchema), editMessage);

// PATCH /api/v1/messages/:mid/deleteforeveryone
router.patch("/:mid/deleteforeveryone", deleteMessageForEveryone);

// PATCH deleteforeveryone/:mid/deleteforme
router.patch("/:mid/deleteforme", deleteMessageForMe);

export default router;
