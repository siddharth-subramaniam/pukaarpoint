import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ trackingId: string }> }) {
  try {
    const resolvedParams = await params;
    const trackingId = resolvedParams.trackingId;

    const resDb = await pool.query(
      'SELECT tracking_id, status, created_at, incident_date, broad_category FROM complaints WHERE tracking_id = $1',
      [trackingId.toUpperCase()]
    );

    if (resDb.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(resDb.rows[0]);
  } catch (error) {
    console.error("Tracking Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
