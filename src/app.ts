import express from 'express';
import authRoutes from './routes/auth.route';
import healthRoutes from './routes/health.route';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/health', healthRoutes);

app.use(errorHandler);

app.get('/', (_req, res) => {
    res.send('Hello TypeScript with Express!');
});

export default app;
