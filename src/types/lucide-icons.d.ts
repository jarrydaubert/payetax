// src/types/lucide-icons.d.ts
// Type declarations for optimized Lucide icon imports (direct ESM paths)
// This bypasses Turbopack tree-shaking issues with barrel exports

declare module 'lucide-react/dist/esm/icons/*.js' {
  import type { LucideIcon } from 'lucide-react';
  const icon: LucideIcon;
  export default icon;
}
