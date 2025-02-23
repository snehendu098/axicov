import { Router } from "express";
import { message } from "../controllers/event.controller";


const router = Router();

router.route('/save').post(message);