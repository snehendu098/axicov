import { Router } from "express";
import {
  getAgentParams,
  initAgent,
  updateAgent,
  getAgents,
} from "../controllers/agent.controller";

const router = Router();

router.route("/init").post(initAgent);
router.route("/update").post(updateAgent);
router.route("/get-params/:threadId").get(getAgentParams);
router.route("/get-agents/:address").get(getAgents);

export default router;
