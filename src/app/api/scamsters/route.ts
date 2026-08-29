import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM scamsters ORDER BY id ASC');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching scamsters:', error);
    return NextResponse.json({ error: 'Failed to fetch database records.' }, { status: 500 });
  }
}
