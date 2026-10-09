import { siteLayout } from './navigation';
export function hasMobileNavigation(path: string) { return siteLayout(path).bottomNav; }
