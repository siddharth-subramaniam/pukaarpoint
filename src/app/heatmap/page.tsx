import HeatmapDashboard from './HeatmapDashboard';

export const metadata = {
  title: "Live Fraud Heatmap | PukaarPoint",
  description: "Real-time intelligence on cybercrime hotspots across India.",
};

export default function HeatmapPage() {
  return (
    <main style={{ padding: '40px 5%', maxWidth: '1600px', margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="heading-serif" style={{ fontSize: '2rem', marginBottom: '16px' }}>Live Fraud Heatmap</h1>
        <p className="text-muted" style={{ fontSize: '1rem', maxWidth: '600px', marginBottom: '32px', lineHeight: 1.6 }}>
          Real-time intelligence on cybercrime and fraud hotspots across India. Use the filters below to explore trends and impact.
        </p>
      </div>
      
      <HeatmapDashboard />
    </main>
  );
}
