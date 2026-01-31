// src/app/api/og/route.tsx
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Get parameters
  const salary = searchParams.get('salary');
  const takeHome = searchParams.get('takeHome');
  const title = searchParams.get('title') || 'UK Tax Calculator';
  const description = searchParams.get('description') || 'Calculate your take-home pay instantly';

  // Format currency
  const formatCurrency = (value: string | null) => {
    if (!value) return null;
    const num = Number.parseFloat(value);
    if (Number.isNaN(num)) return null;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formattedSalary = formatCurrency(salary);
  const formattedTakeHome = formatCurrency(takeHome);
  const hasResults = formattedSalary && formattedTakeHome;

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#020617',
        padding: '60px',
      }}
    >
      {/* Top gradient line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #06b6d4, #10b981)',
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: hasResults ? '32px' : '48px',
        }}
      >
        <span style={{ fontSize: '36px', fontWeight: 700, color: '#f8fafc' }}>paye</span>
        <span
          style={{
            fontSize: '36px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          tax
        </span>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {hasResults ? (
          // Results view
          <>
            <h1
              style={{
                fontSize: '42px',
                fontWeight: 700,
                color: '#f8fafc',
                marginBottom: '24px',
                lineHeight: 1.2,
              }}
            >
              Your Tax Calculation
            </h1>

            <div
              style={{
                display: 'flex',
                gap: '40px',
                marginTop: '16px',
              }}
            >
              {/* Salary */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '28px 36px',
                }}
              >
                <span style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '8px' }}>
                  Gross Salary
                </span>
                <span style={{ fontSize: '48px', fontWeight: 700, color: '#f8fafc' }}>
                  {formattedSalary}
                </span>
              </div>

              {/* Arrow */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  color: '#64748b',
                }}
              >
                →
              </div>

              {/* Take Home */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  borderRadius: '16px',
                  padding: '28px 36px',
                  border: '2px solid rgba(16,185,129,0.3)',
                }}
              >
                <span style={{ fontSize: '18px', color: '#10b981', marginBottom: '8px' }}>
                  Take-Home Pay
                </span>
                <span style={{ fontSize: '48px', fontWeight: 700, color: '#10b981' }}>
                  {formattedTakeHome}
                </span>
              </div>
            </div>
          </>
        ) : (
          // Default view
          <>
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 700,
                color: '#f8fafc',
                marginBottom: '24px',
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>

            <p
              style={{
                fontSize: '28px',
                color: '#94a3b8',
                maxWidth: '80%',
                lineHeight: 1.4,
              }}
            >
              {description}
            </p>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
        }}
      >
        <span style={{ fontSize: '22px', color: '#64748b' }}>payetax.co.uk</span>
        <span style={{ fontSize: '18px', color: '#475569' }}>
          Official HMRC rates • Free • No signup
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
