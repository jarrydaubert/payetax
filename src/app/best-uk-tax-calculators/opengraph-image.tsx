import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px',
        background: 'linear-gradient(135deg, #0f172a 0%, #111827 55%, #052e2b 100%)',
        color: '#e2e8f0',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontSize: 30,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color: '#94a3b8',
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: '#22d3ee',
          }}
        />
        PayeTax
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontSize: 70, lineHeight: 1.05, color: '#f8fafc', fontWeight: 800 }}>
          Best UK Tax Calculators 2026
        </div>
        <div style={{ fontSize: 34, lineHeight: 1.25, color: '#cbd5e1', maxWidth: 1020 }}>
          Compare top PAYE calculators with clear pros, cons, and use-cases.
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: 28,
          color: '#22d3ee',
        }}
      >
        payetax.co.uk
      </div>
    </div>,
    size,
  );
}
