import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { identifier, captchaAnswer, expectedCaptcha } = await req.json();

    if (!identifier || !captchaAnswer || !expectedCaptcha) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (String(captchaAnswer).trim().toLowerCase() !== String(expectedCaptcha).trim().toLowerCase()) {
      return NextResponse.json({ error: 'Invalid Security Captcha' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    // Insert OTP to DB
    await pool.query(
      'INSERT INTO otps (identifier, otp, expires_at) VALUES ($1, $2, $3)',
      [identifier, otp, expiresAt]
    );

    // In a real app, send SMS/Email. Here we just return it for testing/demo.
    return NextResponse.json({ message: 'OTP Sent successfully', otp });
  } catch (error) {
    console.error("send-otp error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
