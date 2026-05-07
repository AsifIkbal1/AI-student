import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkConnection() {
  console.log("--- Database Connection Test ---");
  console.log("Host:", process.env.DB_HOST);
  console.log("User:", process.env.DB_USER);
  console.log("DB Name:", process.env.DB_NAME);
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'paid_system_db'
    });
    
    console.log("\n✅ Success! Connected to MySQL.");
    
    const [tables]: any = await connection.query("SHOW TABLES");
    console.log("Found Tables:", tables.map((t: any) => Object.values(t)[0]));
    
    const [userCount]: any = await connection.query("SELECT COUNT(*) as count FROM users");
    console.log("Total Users in Database:", userCount[0].count);
    
    await connection.end();
  } catch (err: any) {
    console.log("\n❌ Error! Could not connect to MySQL.");
    console.log("Error Message:", err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log("\n💡 SUGGESTION: Your DB_USER or DB_PASSWORD in .env is incorrect for your local setup.");
      console.log("Try setting DB_USER=root and DB_PASSWORD= (empty) in your .env file.");
    }
  }
}

checkConnection();
