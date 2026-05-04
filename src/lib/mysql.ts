import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbName = process.env.DB_NAME || 'paid_system_db';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables if they don't exist
export async function initMySQL() {
  try {
    // First, connect WITHOUT database to create it if missing
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempConnection.end();

    const connection = await pool.getConnection();
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        uid VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        displayName VARCHAR(255),
        photoURL TEXT,
        role ENUM('user', 'admin') DEFAULT 'user',
        status ENUM('active', 'banned') DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Safely add status column if it doesn't exist (for existing databases)
    try {
      await connection.query(`
        ALTER TABLE users ADD COLUMN status ENUM('active', 'banned') DEFAULT 'active'
      `);
    } catch (e: any) {
      // Ignore error if column already exists (Error 1060: Duplicate column name)
      if (e.code !== 'ER_DUP_FIELDNAME') {
        console.error("Error adding status column:", e);
      }
    }

    // Create login logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(255),
        email VARCHAR(255),
        userAgent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
      )
    `);

    // Create subscriptions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(255),
        email VARCHAR(255),
        planId VARCHAR(50),
        interval_period VARCHAR(20),
        amount DECIMAL(10, 2),
        paymentMethod VARCHAR(50),
        transactionId VARCHAR(100),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
      )
    `);

    // Create activity logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(255),
        email VARCHAR(255),
        feature VARCHAR(100),
        action VARCHAR(100),
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    connection.release();
    console.log("MySQL Database initialized successfully.");
  } catch (error) {
    console.error("MySQL Database initialization failed:", error);
  }
}

export default pool;
