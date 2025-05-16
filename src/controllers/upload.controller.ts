import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
            req.fileId = `${uuidv4()}${path.extname(file.originalname)}`;
            cb(null, req.fileId);
        },
    }),
    // TODO: make file limit configurable
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB default file size limit
}).single('file');

export const uploadFile = async (req: Request, res: Response) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: 'File upload failed', details: err.message });
        }

        const file = req.file;
        const { title, description } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            // Save metadata and file path to the database
            const fileRecord = await prisma.files.create({
                data: {
                    user_id: req.tokenPayload?.userId,
                    original_filename: file.originalname,
                    storage_path: `uploads/${req.fileId}`,
                    title: title || null,
                    description: description || null,
                    status: "uploaded",
                },
            });

            res.status(200).json({
                fileId: fileRecord.id,
                uploadStatus: 'uploaded',
            });
        } catch (dbError) {
            console.log(dbError)
            res.status(500).json({ error: 'Failed to upload file! Try again.' });
        }
    });
};