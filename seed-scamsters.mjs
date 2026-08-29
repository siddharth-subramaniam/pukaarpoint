import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;
const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

const MOCK_DATA = [
  { identifier: '+91 9876543210', type: 'Phone', reports: 14, risk: 'High', date: '2023-10-24', notes: 'Impersonating bank official for KYC fraud.' },
  { identifier: 'support@update-kyc-alert.com', type: 'Email', reports: 8, risk: 'High', date: '2023-10-22', notes: 'Phishing links for account takeover.' },
  { identifier: '192.168.1.45', type: 'IP Address', reports: 3, risk: 'Medium', date: '2023-10-20', notes: 'Repeated failed login attempts on local networks.' },
  { identifier: 'fake.seller@ybl', type: 'UPI', reports: 22, risk: 'Critical', date: '2023-10-25', notes: 'OLX advance payment scam.' },
  { identifier: '+91 8888888888', type: 'Phone', reports: 5, risk: 'Medium', date: '2023-10-18', notes: 'Fake customer care number listed on Google.' },
  { identifier: 'win-lottery@gmail.com', type: 'Email', reports: 41, risk: 'Critical', date: '2023-10-26', notes: 'KBC lottery scam emails.' },
  { identifier: 'http://claim-free-iphone.ru', type: 'Website', reports: 112, risk: 'Critical', date: '2023-10-28', notes: 'Phishing site capturing credit card details.' },
  { identifier: '14.139.243.1', type: 'IP Address', reports: 1, risk: 'Low', date: '2023-10-27', notes: 'Suspicious scan activity reported.' }
];

async function seed() {
  await client.connect();
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS scamsters (
      id SERIAL PRIMARY KEY,
      identifier VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      reports INTEGER DEFAULT 0,
      risk VARCHAR(50) NOT NULL,
      date VARCHAR(50),
      notes TEXT
    );
  `);
  
  // clear table to prevent duplicates on rerun
  await client.query('TRUNCATE TABLE scamsters RESTART IDENTITY;');

  for (const item of MOCK_DATA) {
    await client.query(
      'INSERT INTO scamsters (identifier, type, reports, risk, date, notes) VALUES ($1, $2, $3, $4, $5, $6)',
      [item.identifier, item.type, item.reports, item.risk, item.date, item.notes]
    );
  }
  
  console.log('Successfully created and seeded scamsters table');
  await client.end();
}

seed().catch(console.error);
