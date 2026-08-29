import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { trackingId, otp } = await req.json();

    if (!trackingId || !otp) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Lookup the complaint to get the identifier
    const resComplaint = await pool.query(
      'SELECT user_identifier, reporter_email, reporter_phone FROM complaints WHERE tracking_id = $1',
      [trackingId.toUpperCase()]
    );

    if (resComplaint.rows.length === 0) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const complaint = resComplaint.rows[0];
    const identifier = complaint.user_identifier || complaint.reporter_email || complaint.reporter_phone;

    if (!identifier) {
      return NextResponse.json({ error: 'Cannot verify anonymous complaint' }, { status: 403 });
    }

    // Verify the OTP
    const resOtp = await pool.query(
      'SELECT * FROM otps WHERE identifier = $1 AND otp = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [identifier, otp]
    );

    if (resOtp.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // OTP is valid! Mark it as used/delete it
    await pool.query('DELETE FROM otps WHERE id = $1', [resOtp.rows[0].id]);

    // Fetch and return the full complaint details needed for tracking
    const resDb = await pool.query(
      'SELECT tracking_id, status, created_at, incident_date, broad_category FROM complaints WHERE tracking_id = $1',
      [trackingId.toUpperCase()]
    );

    return NextResponse.json({ success: true, complaint: resDb.rows[0] });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
