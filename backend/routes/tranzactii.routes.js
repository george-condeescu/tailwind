import express from "express";
import tranzactieController from "../controllers/tranzactii.controller";

const router = express.Router();


router.post("/document-completa", tranzactieController.createDocumentComplet);

export default router;