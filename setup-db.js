const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres.diwleesvrvoqpnkevlbg:aHG8XBuTrxoGemkZ@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        tracking_id VARCHAR(50) UNIQUE NOT NULL,
        user_identifier VARCHAR(100),
        broad_category VARCHAR(100),
        sub_category VARCHAR(100),
        is_anonymous BOOLEAN DEFAULT false,
        reporter_name VARCHAR(100),
        reporter_phone VARCHAR(50),
        reporter_email VARCHAR(100),
        reporter_address TEXT,
        national_id VARCHAR(50),
        incident_date TIMESTAMP,
        incident_description TEXT,
        platform VARCHAR(100),
        delay_reason TEXT,
        suspect_details JSONB,
        status VARCHAR(50) DEFAULT 'registered',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized successfully!");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    pool.end();
  }
}

init();
