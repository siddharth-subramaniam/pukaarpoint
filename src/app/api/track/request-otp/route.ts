import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { trackingId } = await req.json();

    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID is required' }, { status: 400 });
    }

    const resDb = await pool.query(
      'SELECT user_identifier, reporter_email, reporter_phone, is_anonymous FROM complaints WHERE tracking_id = $1',
      [trackingId.toUpperCase()]
    );

    if (resDb.rows.length === 0) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const complaint = resDb.rows[0];
    
    // Determine the best identifier to send the OTP to
    let identifier = complaint.user_identifier || complaint.reporter_email || complaint.reporter_phone;

    if (!identifier) {
      return NextResponse.json({ error: 'This complaint was filed completely anonymously and cannot be tracked to protect victim privacy.' }, { status: 403 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    // Insert OTP to DB
    await pool.query(
      'INSERT INTO otps (identifier, otp, expires_at) VALUES ($1, $2, $3)',
      [identifier, otp, expiresAt]
    );

    // Create masked identifier for UI (e.g. s***@gmail.com or +91******7890)
    let maskedIdentifier = identifier;
    if (identifier.includes('@')) {
      const [name, domain] = identifier.split('@');
      maskedIdentifier = name.charAt(0) + '***@' + domain;
    } else if (identifier.length > 4) {
      maskedIdentifier = '******' + identifier.slice(-4);
    }

    // Return success along with the demo OTP for hackathon purposes
    return NextResponse.json({ 
      success: true, 
      maskedIdentifier,
      demoOtp: otp 
    });

  } catch (error) {
    console.error("OTP Request Error:", error);
    return NextResponse.json({ error: 'Failed to request OTP' }, { status: 500 });
  }
}
