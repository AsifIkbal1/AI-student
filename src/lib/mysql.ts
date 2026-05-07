import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbName = process.env.DB_NAME || 'paid_system_db';

let pool: any = null;

function createMySqlPool(user: string, password: string) {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: user,
    password: password,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
  });
}

export async function initMySQL() {
  let user = process.env.DB_USER || 'root';
  let password = process.env.DB_PASSWORD || '';
  let connection;

  console.log("🔍 Attempting MySQL connection...");

  try {
    // Attempt 1: From .env
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: user,
      password: password,
    });
    console.log("✅ MySQL connected using .env credentials.");
  } catch (err: any) {
    // Catch ANY access denied or connection error to try fallback
    console.warn(`⚠️ Connection failed with .env credentials: ${err.message}`);
    console.log("🔄 Trying local fallback (root/empty password)...");
    
    try {
      user = 'root';
      password = '';
      connection = await mysql.createConnection({
        host: 'localhost',
        user: user,
        password: password,
      });
      console.log("✅ Success! Connected using fallback local root.");
    } catch (fallbackErr: any) {
      console.error("❌ FATAL: Could not connect to MySQL at all.", fallbackErr.message);
      console.log("\n💡 SOLUTION: Make sure your MySQL (XAMPP/MAMP) is RUNNING on localhost:3306");
      return;
    }
  }

  if (connection) {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();
  }

  pool = createMySqlPool(user, password);
  
  try {
    const conn = await pool.getConnection();
    await conn.query(`CREATE TABLE IF NOT EXISTS users (uid VARCHAR(255) PRIMARY KEY, email VARCHAR(255) NOT NULL, displayName VARCHAR(255), photoURL TEXT, role ENUM('user', 'admin') DEFAULT 'user', status ENUM('active', 'banned') DEFAULT 'active', createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    
    const columns = [
      { name: 'status', def: "ENUM('active', 'banned') DEFAULT 'active'" },
      { name: 'referral_code', def: "VARCHAR(50) UNIQUE" },
      { name: 'referred_by', def: "VARCHAR(255)" },
      { name: 'referral_earnings', def: "INT DEFAULT 0" }
    ];

    for (const col of columns) {
      try { await conn.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.def}`); } catch (e) {}
    }

    await conn.query(`CREATE TABLE IF NOT EXISTS support_tickets (id INT AUTO_INCREMENT PRIMARY KEY, uid VARCHAR(255) NOT NULL, email VARCHAR(255), subject VARCHAR(255) NOT NULL, message TEXT NOT NULL, status ENUM('open', 'closed') DEFAULT 'open', reply TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await conn.query(`CREATE TABLE IF NOT EXISTS system_settings (setting_key VARCHAR(100) PRIMARY KEY, setting_value TEXT)`);
    await conn.query(`INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES ('maintenance_mode', 'false'), ('total_api_limit', '1000000')`);
    await conn.query(`CREATE TABLE IF NOT EXISTS api_usage (id INT AUTO_INCREMENT PRIMARY KEY, uid VARCHAR(255), model VARCHAR(100), prompt_tokens INT DEFAULT 0, completion_tokens INT DEFAULT 0, total_tokens INT DEFAULT 0, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await conn.query(`CREATE TABLE IF NOT EXISTS login_logs (id INT AUTO_INCREMENT PRIMARY KEY, uid VARCHAR(255), email VARCHAR(255), userAgent TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await conn.query(`CREATE TABLE IF NOT EXISTS subscriptions (id INT AUTO_INCREMENT PRIMARY KEY, uid VARCHAR(255), email VARCHAR(255), planId VARCHAR(50), interval_period VARCHAR(20), amount DECIMAL(10, 2), paymentMethod VARCHAR(50), transactionId VARCHAR(100), timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await conn.query(`CREATE TABLE IF NOT EXISTS activity_logs (id INT AUTO_INCREMENT PRIMARY KEY, uid VARCHAR(255), email VARCHAR(255), feature VARCHAR(100), action VARCHAR(100), details TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

    conn.release();
    console.log("🚀 Database Initialized Successfully.");
  } catch (err: any) {
    console.error("❌ Table initialization failed:", err.message);
  }
}

const ensurePool = async () => {
  if (!pool) {
    let attempts = 0;
    while (!pool && attempts < 10) {
      await new Promise(r => setTimeout(r, 500));
      attempts++;
    }
  }
  if (!pool) throw new Error("Database not connected. Please make sure MySQL is running on your machine.");
  return pool;
};

export default {
  query: async (...args: any[]) => {
    const p = await ensurePool();
    return p.query(...args);
  },
  getConnection: async () => {
    const p = await ensurePool();
    return p.getConnection();
  },
  execute: async (...args: any[]) => {
    const p = await ensurePool();
    return p.execute(...args);
  }
};
