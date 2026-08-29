import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'admin_super_secret_demo';

function isAuthenticated(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;
  
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (e) {
    return false;
  }
}

export async function GET(req: Request) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resDb = await pool.query('SELECT * FROM complaints ORDER BY created_at DESC');
    return NextResponse.json(resDb.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { tracking_id, status } = await req.json();
    await pool.query('UPDATE complaints SET status = $1 WHERE tracking_id = $2', [status, tracking_id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
