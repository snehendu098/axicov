import { Router } from "express";
import { createAgent, updateAgent } from "../controllers/agent.controller";


const router = Router();

router.route('/createAgent').post(createAgent);
router.route('/updateAgent/:id').put(updateAgent);

export default router;