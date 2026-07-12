import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createSuperAdmin = async () => {
  try {
    const name = 'Super Admin';
    const email = 'admin@assetflow.com';
    const password = 'adminpassword123';

    // Delete if exists so we always have a fresh one for testing
    await pool.query('DELETE FROM users WHERE email = $1', [email]);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      'INSERT INTO users (name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5)',
      [name, email, hashedPassword, 'Admin', 'Active']
    );

    console.log("✅ SUCCESS! Admin user created.");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
};

createSuperAdmin();
