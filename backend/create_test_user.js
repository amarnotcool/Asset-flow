import fs from 'fs';
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTestAdmin = async () => {
  try {
    const name = 'Test User';
    const email = 'name@company.com';
    const password = 'password123';

    console.log(`Checking if ${email} already exists...`);
    const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      console.log('Test user already exists!');
      process.exit(0);
    }

    console.log('Encrypting password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Injecting user directly into Neon Postgres...');
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, 'Admin']
    );

    console.log("✅ SUCCESS! Test user created. You can now log in!");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
};

createTestAdmin();
