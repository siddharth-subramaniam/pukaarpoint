require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        tracking_id VARCHAR(20) UNIQUE NOT NULL,
        user_identifier TEXT, -- Can be null for anonymous
        broad_category VARCHAR(100) NOT NULL,
        sub_category VARCHAR(100) NOT NULL,
        is_anonymous BOOLEAN DEFAULT false,
        reporter_name VARCHAR(255),
        reporter_phone VARCHAR(50),
        reporter_email VARCHAR(255),
        incident_date TIMESTAMP NOT NULL,
        incident_description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'registered',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Complaints table created successfully');
  } catch(e) {
    console.error('Error creating table:', e);
  } finally {
    process.exit();
  }
}

updateDb();
