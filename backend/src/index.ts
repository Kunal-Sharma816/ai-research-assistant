import dotenv from "dotenv";
dotenv.config(); 

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { connectDatabase } from "./config/database";
import paperRoutes from "./routes/papers";
import chatRoutes from "./routes/chat";
import citationRoutes from "./routes/citations";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json({ limit: '50mb' })); // Increased limit for base64/PDFs
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(limiter);

// Debug Logger
app.use((req, res, next) => {
    console.log(`👉 ${req.method} ${req.path}`);
    next();
});

// Routes
app.use("/api/papers", paperRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/citations", citationRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || "Internal Server Error" });
});

console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);


// Start server
const startServer = async () => {
    try {
        await connectDatabase();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
};

startServer();