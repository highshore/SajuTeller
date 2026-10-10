import { useI18n } from '../i18n/i18n';
import { Link, useLocation } from 'react-router-dom';
import { styled } from 'styled-components';
import { navigation, siteLayout } from './navigation';
const Dock = styled.nav`
  display:none;
  @container saju (max-width:850px){display:grid;grid-template-columns:repeat(5,minmax(0,1fr));position:fixed;bottom:0;left:50%;right:auto;width:min(100%,var(--st-app-width));transform:translateX(-50%);z-index:90;background:rgb(28 16 39 / 97%);backdrop-filter:blur(18px);border-top:1px solid var(--st-line);padding:8px 6px calc(8px + env(safe-area-inset-bottom));
  a{min-height:56px;display:flex;flex-direction:column;gap:5px;align-items:center;justify-content:center;color:var(--st-muted);font-size:10px;font-weight:600;letter-spacing:0;min-width:0;text-align:center;overflow-wrap:anywhere;}svg{width:22px;height:22px;stroke-width:1.5;}a[aria-current]{color:var(--st-gold);}a[aria-current] svg{stroke-width:2;}}
`;
export default function MobileNavigation() { const { t } = useI18n(); const { pathname } = useLocation(); if (!siteLayout(pathname).bottomNav) return null; return <Dock data-global-bottom-nav aria-label="Mobile navigation">{navigation.map(item => <Link to={item.to} key={item.to} aria-current={item.matches(pathname) ? 'page' : undefined}><item.icon/><span>{t(item.label)}</span></Link>)}</Dock>; }
