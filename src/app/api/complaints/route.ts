import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      userIdentifier,
      broadCategory,
      subCategory,
      isAnonymous,
      name,
      phone,
      email,
      address,
      nationalId,
      incidentDate,
      incidentDescription,
      platform,
      delayReason,
      suspectDetails,
    } = data;

    // Generate Tracking ID (e.g. CYB-123456)
    const trackingId = 'CYB-' + Math.floor(100000 + Math.random() * 900000);

    await pool.query(
      `INSERT INTO complaints (
        tracking_id, user_identifier, broad_category, sub_category, 
        is_anonymous, reporter_name, reporter_phone, reporter_email, 
        incident_date, incident_description, platform, delay_reason, 
        suspect_details, reporter_address, national_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        trackingId, 
        userIdentifier || null, 
        broadCategory, 
        subCategory, 
        isAnonymous, 
        isAnonymous ? null : name, 
        isAnonymous ? null : phone, 
        isAnonymous ? null : email, 
        incidentDate || new Date().toISOString(), 
        incidentDescription,
        platform || null,
        delayReason || null,
        suspectDetails ? JSON.stringify(suspectDetails) : null,
        isAnonymous ? null : address,
        isAnonymous ? null : nationalId
      ]
    );

    return NextResponse.json({ success: true, trackingId });
  } catch (error) {
    console.error("Complaint Submission Error:", error);
    return NextResponse.json({ error: 'Failed to submit complaint' }, { status: 500 });
  }
}
