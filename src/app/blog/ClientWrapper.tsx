'use client';

import type React from 'react';
import Layout from '@/components/templates/Layout';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return <Layout>{children}</Layout>;
}
