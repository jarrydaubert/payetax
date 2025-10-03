// Route type definitions for Next.js Link components
// This provides proper type safety for internal and external links

export type InternalRoute =
  | '/'
  | '/about'
  | '/blog'
  | '/privacy'
  | '/compliance'
  | '/offline'
  | `/blog/${string}` // Dynamic blog routes
  | `/blog/category/${string}`; // Dynamic category routes

export type ExternalRoute = `https://${string}` | `http://${string}` | `mailto:${string}`;

export type Route = InternalRoute | ExternalRoute;

// Helper function to determine if a route is external
export function isExternalRoute(href: string): href is ExternalRoute {
  return href.startsWith('http') || href.startsWith('mailto:');
}

// Type guard for internal routes
export function isInternalRoute(href: string): href is InternalRoute {
  return !isExternalRoute(href);
}
