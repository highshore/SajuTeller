import { NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, MapPinIcon, SparklesIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { styled } from 'styled-components';
import { hasMobileNavigation } from './mobile_navigation_routes';
const Dock = styled.nav`
  display:none;
  @media(max-width:768px) {
    display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:4px;
    position:fixed; bottom:max(12px,env(safe-area-inset-bottom)); left:50%; transform:translateX(-50%);
    width:calc(100% - 24px); max-width:440px; z-index:90; padding:6px;
    border:1px solid #ffffff25; border-radius:28px; background:#160d25f0;
    backdrop-filter:blur(18px); box-shadow:0 8px 30px #0004;
    a { min-height:52px; display:flex; flex-direction:column; gap:4px; align-items:center; justify-content:center; border-radius:22px; color:#c4b6d5; font-size:10px; font-weight:600; }
    a.active { background:#b99bdc24; color:#ead7ff; }
    svg { width:22px; height:22px; }
  }
`;
export default function MobileNavigation() {
  const { pathname } = useLocation();
  if (!hasMobileNavigation(pathname)) return null;
  return <Dock aria-label="Mobile navigation">
    <NavLink to="/" end><HomeIcon/><span>Home</span></NavLink>
    <NavLink to="/locations"><MapPinIcon/><span>Explore</span></NavLink>
    <NavLink to="/today-fortune"><SparklesIcon/><span>Fortune</span></NavLink>
    <NavLink to="/profile"><UserCircleIcon/><span>My Saju</span></NavLink>
  </Dock>;
}
