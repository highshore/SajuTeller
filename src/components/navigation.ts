import { HomeIcon, MapPinIcon, CalendarDaysIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// One route definition drives both desktop and mobile navigation.
export const navigation = [
  { to: '/', label: 'Explore', icon: HomeIcon, matches: (p: string) => p === '/' || p.startsWith('/experiences') || p.startsWith('/search') || p.startsWith('/business') },
  { to: '/map', label: 'Map', icon: MapPinIcon, matches: (p: string) => p === '/map' },
  { to: '/trips', label: 'Bookings', icon: CalendarDaysIcon, matches: (p: string) => p.startsWith('/trips') },
  { to: '/profile', label: 'Profile', icon: UserCircleIcon, matches: (p: string) => p.startsWith('/profile') || p.startsWith('/saved') },
];

export function siteLayout(path: string) {
  const immersive = /^\/live-translation(?:\/|$)/.test(path);
  const booking = /^\/business\//.test(path);
  return { header: !immersive, footer: !immersive, bottomNav: !immersive && !booking, compactFooter: path === '/' || /^\/(sign-|auth-|onboarding)/.test(path) };
}
