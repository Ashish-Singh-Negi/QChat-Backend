import { Router } from "express";
import {
  deleteMessageForEveryone,
  deleteMessageForMe,
  getMessage,
  getAllMessages,
  updatePinMessage,
  editMessage,
  storeMessage,
} from "../controllers/chat/message";

const router = Router();

router.get("/:mid", getMessage);

router.post("/", storeMessage);

router.patch("/:mid/pin", updatePinMessage);
router.patch("/:mid/edit", editMessage);
router.patch("/:mid/deleteforeveryone", deleteMessageForEveryone);
router.patch("/:mid/deleteforme", deleteMessageForMe);

// router.patch("/:mid/star", updateStarMessage);

export default router;
