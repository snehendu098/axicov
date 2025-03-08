import { Router } from "express";
import { message, fetchAllMessages } from "../controllers/event.controller";

const router = Router();

router.route("/save").post(message);
router.route("/get-messages/:agentId/:address").get(fetchAllMessages);

export default router;
