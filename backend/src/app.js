import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

import authRoutes from './routes/authRoutes.routes.js';
import orgRoutes from './routes/orgRoutes.routes.js';
import assetRoutes from './routes/assetRoutes.routes.js';
import operationsRoutes from './routes/operationsRoutes.routes.js';
import auditRoutes from './routes/auditRoutes.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/audits', auditRoutes);

// Global error handler — catches ApiError thrown by controllers
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    statusCode,
    message: err.message || 'Internal Server Error',
    success: false,
    errors: err.errors || [],
  });
});

export { app };