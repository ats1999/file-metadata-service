import { Router } from "express";
import { uploadFile, getFileInfo } from "../controllers/file.controller";

const router = Router();

router.post("/upload", uploadFile);
router.get("/:fileId", getFileInfo);

export default router;
