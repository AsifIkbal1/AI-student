import pool from './src/lib/mysql.js';

async function test() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('--- DATABASE CHECK ---');
    console.log('Tables found:', rows.length);
    rows.forEach(row => console.log(' - ' + Object.values(row)[0]));
    console.log('----------------------');
    process.exit(0);
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

test();
