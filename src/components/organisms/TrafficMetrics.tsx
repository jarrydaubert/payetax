'use client';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { sanitizeVercelTelemetry } from '@/lib/telemetryUrl';

export function TrafficMetrics() {
  return (
    <>
      <Analytics beforeSend={sanitizeVercelTelemetry} />
      <SpeedInsights beforeSend={sanitizeVercelTelemetry} />
    </>
  );
}
