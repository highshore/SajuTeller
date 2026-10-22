import { useI18n } from '../i18n/i18n';
import { Link, useLocation } from 'react-router-dom';
import { styled } from 'styled-components';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Page, Wrap } from '../product/ui';
import { policies } from '../product/policies';

const Root = styled.article`
  .kicker{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--st-brand);}
  h1{font:600 40px/1.05 'Cormorant Garamond',serif;letter-spacing:-.5px;margin:8px 0 20px;}
  .switcher{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:0 -16px 8px;padding:0 16px 4px;}
  .switcher a{flex:none;display:flex;align-items:center;min-height:38px;padding:0 14px;border-radius:999px;border:1px solid var(--st-accent-line);font-size:14px;font-weight:600;white-space:nowrap;color:var(--st-ink);}
  .switcher a[aria-current=page]{background:var(--st-ink);border-color:var(--st-ink);color:var(--st-paper);}
  ol{list-style:none;margin:0;padding:0;}
  li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:12px;padding:20px 0;border-bottom:1px solid var(--st-line);}
  .n{font-size:13px;font-weight:700;color:var(--st-faint);font-variant-numeric:tabular-nums;padding-top:2px;}
  h2{font-size:17px;font-weight:600;letter-spacing:0;line-height:1.35;margin:0 0 6px;}
  p{font-size:15px;line-height:1.6;color:var(--st-muted);}
  .help{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:56px;margin-top:20px;padding:0 16px;border-radius:14px;background:var(--st-elevated);font-size:15px;font-weight:600;}
  .help svg{width:18px;color:var(--st-faint);}
`;
const links = [['/terms', 'Terms'], ['/privacy', 'Privacy'], ['/refund-policy', 'Cancellation']] as const;

export default function Legal() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const policy = policies[pathname as keyof typeof policies] || policies['/terms'];
  return <Page><Wrap><Root>
    <span className="kicker">SajuTeller</span>
    <h1>{t(policy.title)}</h1>
    <nav className="switcher" aria-label={t('Policies')}>{links.map(([to, label]) => <Link key={to} to={to} aria-current={pathname === to ? 'page' : undefined}>{t(label)}</Link>)}</nav>
    <ol>{policy.sections.map(([title, body], i) => <li key={title}><span className="n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><div><h2>{t(title)}</h2><p>{t(body)}</p></div></li>)}</ol>
    <Link className="help" to="/support">{t('Questions? Contact support →').replace(/\s*→$/, '')}<ChevronRightIcon/></Link>
  </Root></Wrap></Page>;
}
