import { Router } from "express";
import { signup } from "../controllers/user.controller";

const router = Router();


export default router;

router.route("/signup").post(signup);