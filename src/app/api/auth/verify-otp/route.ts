import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'super_secret_key_for_demo';

export async function POST(req: Request) {
  try {
    const { identifier, otp } = await req.json();

    if (!identifier || !otp) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check OTP
    const resOtp = await pool.query(
      'SELECT * FROM otps WHERE identifier = $1 AND otp = $2 AND expires_at > CURRENT_TIMESTAMP ORDER BY id DESC LIMIT 1',
      [identifier, otp]
    );

    if (resOtp.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Check if user exists, else create
    const userRes = await pool.query('SELECT * FROM users WHERE identifier = $1', [identifier]);
    let user = userRes.rows[0];

    if (!user) {
      const insertRes = await pool.query(
        'INSERT INTO users (identifier) VALUES ($1) RETURNING id, identifier',
        [identifier]
      );
      user = insertRes.rows[0];
    }

    // Generate token
    const token = jwt.sign({ id: user.id, identifier: user.identifier }, JWT_SECRET, { expiresIn: '1d' });

    // Clean up used OTP
    await pool.query('DELETE FROM otps WHERE identifier = $1', [identifier]);

    return NextResponse.json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error("verify-otp error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
