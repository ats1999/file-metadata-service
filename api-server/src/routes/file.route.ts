import { Router } from "express";
import expressRateLimit from "express-rate-limit";
import {
  uploadFile,
  getFileInfo,
  getFilesInfo,
} from "../controllers/file.controller";
import { getUploadRateLimitOptions } from "../utils";

const updateRateLimitOptions = getUploadRateLimitOptions();

const userRateLimiter = expressRateLimit({
  windowMs: updateRateLimitOptions.windowMs as number, // 1 day
  max: updateRateLimitOptions.max as number,
  message: { error: "Too many requests, try again later." },
  keyGenerator: (req, _) => {
    return String(req.tokenPayload?.userId);
  },
});

const router = Router();
router.use("/upload", userRateLimiter);
router.post("/upload", uploadFile);
router.get("/:fileId", getFileInfo);
router.get("/", getFilesInfo);

export default router;
