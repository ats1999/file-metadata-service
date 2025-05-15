import express from 'express';
import authRoutes from './routes/auth.route';

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/', (_req, res) => {
    res.send('Hello TypeScript with Express!');
});

export default app;
