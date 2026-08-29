import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const crimeType = searchParams.get('crimeType') || 'all';
  const days = parseInt(searchParams.get('days') || '180', 10);
  const status = searchParams.get('status') || 'all';

  try {
    const conditions: string[] = [`reported_at >= NOW() - INTERVAL '${days} days'`];
    const params: unknown[] = [];

    if (crimeType !== 'all') {
      params.push(crimeType);
      conditions.push(`crime_type = $${params.length}`);
    }
    if (status !== 'all') {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    // Points for heatmap
    const pointsQuery = `
      SELECT lat, lng, crime_type, city, state, amount_lost, status, reported_at
      FROM fraud_reports
      ${where}
      ORDER BY reported_at DESC
      LIMIT 2000
    `;

    // Aggregates per city
    const cityQuery = `
      SELECT
        city,
        state,
        AVG(lat) as lat,
        AVG(lng) as lng,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'investigating' THEN 1 END) as investigating,
        COALESCE(SUM(amount_lost), 0) as total_amount_lost,
        MODE() WITHIN GROUP (ORDER BY crime_type) as top_crime
      FROM fraud_reports
      ${where}
      GROUP BY city, state
      ORDER BY total DESC
    `;

    // Summary stats
    const statsQuery = `
      SELECT
        COUNT(*) as total_reports,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'investigating' THEN 1 END) as investigating,
        COALESCE(SUM(amount_lost), 0) as total_amount_lost,
        COALESCE(AVG(amount_lost), 0) as avg_amount_lost
      FROM fraud_reports
      ${where}
    `;

    // Crime type breakdown
    const crimeBreakdownQuery = `
      SELECT crime_type, COUNT(*) as count
      FROM fraud_reports
      ${where}
      GROUP BY crime_type
      ORDER BY count DESC
    `;

    // Monthly trend (last 6 months)
    const trendQuery = `
      SELECT
        TO_CHAR(DATE_TRUNC('month', reported_at), 'Mon YYYY') as month,
        DATE_TRUNC('month', reported_at) as month_date,
        COUNT(*) as count
      FROM fraud_reports
      WHERE reported_at >= NOW() - INTERVAL '6 months'
      ${crimeType !== 'all' ? `AND crime_type = '${crimeType}'` : ''}
      ${status !== 'all' ? `AND status = '${status}'` : ''}
      GROUP BY DATE_TRUNC('month', reported_at)
      ORDER BY month_date ASC
    `;

    const [pointsRes, cityRes, statsRes, crimeRes, trendRes] = await Promise.all([
      pool.query(pointsQuery, params),
      pool.query(cityQuery, params),
      pool.query(statsQuery, params),
      pool.query(crimeBreakdownQuery, params),
      pool.query(trendQuery),
    ]);

    return NextResponse.json({
      points: pointsRes.rows,
      cities: cityRes.rows,
      stats: statsRes.rows[0],
      crimeBreakdown: crimeRes.rows,
      trend: trendRes.rows,
    });
  } catch (e: unknown) {
    console.error(e);
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
