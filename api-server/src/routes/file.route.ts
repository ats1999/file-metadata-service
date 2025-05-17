import { Router } from "express";
import {
  uploadFile,
  getFileInfo,
  getFilesInfo,
} from "../controllers/file.controller";

const router = Router();

router.post("/upload", uploadFile);
router.get("/:fileId", getFileInfo);
router.get("/", getFilesInfo);

export default router;
