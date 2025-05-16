import { Queue } from 'bullmq';
import connection from '../redis';

interface FileJobData {
    fileId: number;
    userId: number;
    storagePath: string
}

// Define a queue with typed job data
const fileQueue = new Queue<FileJobData>('file-processing', { connection });

export default fileQueue;