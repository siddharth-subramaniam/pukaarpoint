require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function addFields() {
  try {
    await pool.query(`
      ALTER TABLE complaints
      ADD COLUMN IF NOT EXISTS platform VARCHAR(100),
      ADD COLUMN IF NOT EXISTS delay_reason TEXT,
      ADD COLUMN IF NOT EXISTS suspect_details JSONB,
      ADD COLUMN IF NOT EXISTS reporter_address TEXT,
      ADD COLUMN IF NOT EXISTS national_id VARCHAR(100);
    `);
    console.log('Columns added successfully');
  } catch(e) {
    console.error('Error adding columns:', e);
  } finally {
    process.exit();
  }
}

addFields();
