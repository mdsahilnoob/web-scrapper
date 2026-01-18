import express from 'express';
import crawlRoutes from './routes/crawl.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

app.use('/api', crawlRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path,
    });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});

app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
