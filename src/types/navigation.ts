// Navigation types for consistent link handling
import type { Route } from './routes';

export interface NavigationLink {
  name: string;
  href: Route;
  icon?: React.ReactNode;
  external?: boolean;
}

export interface NavigationSection {
  title: string;
  links: NavigationLink[];
}
