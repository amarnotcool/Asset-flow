import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seed = async () => {
  try {
    console.log("Reading schema.sql...");
    const schema = fs.readFileSync('schema.sql', 'utf8');
    
    console.log("Connecting to the live database...");
    await pool.query(schema);
    
    console.log("✅ SUCCESS! All tables have been successfully injected into Neon database.");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR setting up database:", err.message);
    process.exit(1);
  }
};

seed();
