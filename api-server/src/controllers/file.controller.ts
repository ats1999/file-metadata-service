import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import bytes from "bytes";
import fileProcessingQueue from "../jobs/fileProcessingQueue";

const FILE_UPLOAD_PATH = process.env.FILE_UPLOAD_PATH || "./uploads";
const UPLOAD_FILE_SIZE_LIMIT = process.env.UPLOAD_FILE_SIZE_LIMIT || "";
const UPLOAD_FILE_SIZE_LIMIT_DEFAULT = 10 * 1024 * 1024; // 10 MB
const fileSizeLimit =
  bytes(UPLOAD_FILE_SIZE_LIMIT) || UPLOAD_FILE_SIZE_LIMIT_DEFAULT;

const prisma = new PrismaClient();

const jobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000, // 1 second delay before retrying
  },
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: FILE_UPLOAD_PATH,
    filename: (req, file, cb) => {
      req.fileId = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, req.fileId);
    },
  }),

  limits: {
    fileSize: fileSizeLimit,
  },
}).single("file");

export const uploadFile = async (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ error: "File upload failed", details: err.message });
    }

    const file = req.file;
    const { title, description } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Ensure user_id is present
      if (!req.tokenPayload?.userId) {
        return res
          .status(400)
          .json({ error: "User ID is missing from token payload" });
      }

      // Save metadata and file path to the database
      const fileRecord = await prisma.files.create({
        data: {
          user_id: req.tokenPayload.userId,
          original_filename: file.originalname,
          storage_path: `${FILE_UPLOAD_PATH}/${req.fileId}`,
          title: title || null,
          description: description || null,
          status: "uploaded",
        },
      });

      fileProcessingQueue.add(
        "fileProcessing", // Job name
        {
          fileId: fileRecord.id,
          storagePath: fileRecord.storage_path,
        },
        jobOptions
      );

      res.status(200).json({
        fileId: fileRecord.id,
        uploadStatus: "uploaded",
      });
    } catch (dbError) {
      console.log(dbError);
      res.status(500).json({ error: "Failed to upload file! Try again." });
    }
  });
};

export const getFileInfo = async (req: Request, res: Response) => {
  const { userId } = req.tokenPayload!;
  const { fileId } = req.params;

  try {
    const fileRecord = await prisma.files.findUnique({
      where: { id: Number(fileId), user_id: userId },
    });

    if (!fileRecord) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const fileInfo = {
      title: fileRecord.title,
      description: fileRecord.description,
      status: fileRecord.status,
      metaData: fileRecord.extracted_data,
    };

    res.status(200).json(fileInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve file info" });
  }
};

export const getFilesInfo = async (req: Request, res: Response) => {
  const { userId } = req.tokenPayload!;
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const offset = (pageNumber - 1) * limitNumber;

  const files = await prisma.files.findMany({
    where: { user_id: userId },
    skip: offset,
    take: limitNumber,
    orderBy: {
      uploaded_at: "desc",
    },
  });

  const filesInfo = files.map((file) => ({
    id: file.id,
    title: file.title,
    description: file.description,
    status: file.status,
    uploadedAt: file.uploaded_at,
    metaData: file.extracted_data,
  }));

  res.status(200).json({
    files: filesInfo,
    currentPage: pageNumber,
    limit: limitNumber,
  });
};
