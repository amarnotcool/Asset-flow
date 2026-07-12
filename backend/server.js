import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './src/config/db.js';

import authRoutes from './src/routes/authRoutes.js';
import orgRoutes from './src/routes/orgRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);

const PORT = process.env.PORT || 5000;

app.get('/api/health', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ status: 'ok', dbTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
