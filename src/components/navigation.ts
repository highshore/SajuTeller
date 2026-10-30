import { HomeIcon, MapPinIcon, CalendarDaysIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

// One route definition drives both desktop and mobile navigation.
export const navigation = [
  { to: '/', label: 'Discover', icon: HomeIcon, matches: (p: string) => p === '/' || p.startsWith('/experiences') || p.startsWith('/search') || p.startsWith('/business') },
  { to: '/map', label: 'Map', icon: MapPinIcon, matches: (p: string) => p === '/map' },
  { to: '/trips', label: 'My Journey', icon: CalendarDaysIcon, matches: (p: string) => p.startsWith('/trips') },
  { to: '/messages', label: 'Messages', icon: ChatBubbleLeftRightIcon, matches: (p: string) => p.startsWith('/messages') },
  { to: '/profile', label: 'Profile', icon: UserCircleIcon, matches: (p: string) => p.startsWith('/profile') || p.startsWith('/saved') },
];

export function siteLayout(path: string) {
  const immersive = /^\/(live-translation|live\/watch|onboarding)(?:\/|$)/.test(path);
  // Every page stays in the phone-width app column (--st-app-width), at every viewport.
  const booking = /^\/business\//.test(path);
  return { header: !immersive, footer: !immersive, bottomNav: !immersive && !booking, compactFooter: path === '/' || /^\/(sign-|auth-|onboarding)/.test(path) };
}

// Brand routes keep the night header (Figma: Home hero, live interpretation).
export function nightRoute(path: string) {
  return path === '/' || /^\/(live-translation|live\/watch)(?:\/|$)/.test(path);
}
