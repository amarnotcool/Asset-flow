import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials:true
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
import authRoutes from './routes/authRoutes.js';
import orgRoutes from './routes/orgRoutes.js';
import operationsRoutes from './routes/operationsRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/operations', operationsRoutes);

app.use(cookieParser());

export{app}