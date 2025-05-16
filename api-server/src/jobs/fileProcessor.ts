import { Worker, Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import * as fs from "fs/promises";
import path from "path";
import FileJobData from "../interfaces/FileJobData";
import connection from "../redis";

const prisma = new PrismaClient();

// Helper to get file type from extension
function getFileType(filePath: string): string {
  return path.extname(filePath).replace(".", "").toLowerCase();
}

// Helper to calculate checksum
async function calculateChecksum(filePath: string): Promise<string> {
  const hash = createHash("sha256");
  const fileBuffer = await fs.readFile(filePath);
  hash.update(fileBuffer);
  return hash.digest("hex");
}

// BullMQ Worker
const fileProcessorWorker = new Worker<FileJobData>(
  "file-processing",
  async (job: Job<FileJobData>) => {
    const { fileId, storagePath } = job.data;

    // Read file stats
    const stats = await fs.stat(storagePath);
    const size = stats.size;
    const fileType = getFileType(storagePath);
    const checkSum = await calculateChecksum(storagePath);

    const extractedData = {
      size,
      fileType: fileType,
      checksum: checkSum,
    };

    // Save metadata to DB
    await prisma.files.update({
      where: { id: fileId },
      data: {
        extracted_data: extractedData,
      },
    });
  },
  { connection }
);

fileProcessorWorker.on("completed", (job) => {
  console.log(`Processed file ${job.data.fileId}`);
});

fileProcessorWorker.on("failed", (job, err) => {
  console.error(`Failed processing file job ${job?.data.fileId}:`, err);
});
