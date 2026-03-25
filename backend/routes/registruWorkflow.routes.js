import express from "express";
import {createRegistruWorkflow} from "../controllers/registruWorkflow.controller.js";

const router = express.Router();


router.post("/", createRegistruWorkflow);

export default router;