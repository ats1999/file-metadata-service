import { Queue } from 'bullmq';
import connection from '../redis';
import FileJobData from '../interfaces/FileJobData';


// TODO: get queue name from env
const fileQueue = new Queue<FileJobData>('file-processing', { connection });

export default fileQueue;