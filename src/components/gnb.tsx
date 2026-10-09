import LocaleSelector from './locale-selector';
import { useI18n } from '../i18n/i18n';
import { Link, useLocation } from 'react-router-dom';
import { styled } from 'styled-components';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useAccount } from '../product/data';
import { navigation } from './navigation';

const Header = styled.header`
  position:sticky;top:0;z-index:100;height:var(--ks-header-height);background:rgb(11 6 16 / 94%);backdrop-filter:blur(18px);border-bottom:1px solid var(--st-line);
  .inner{width:min(1160px,calc(100% - 32px));margin:auto;height:100%;display:flex;align-items:center;justify-content:space-between;gap:24px;}
  .brand{font:500 26px/30px 'Cormorant Garamond',serif;letter-spacing:.4px;}
  nav{display:flex;align-items:center;gap:28px;}nav a{font-size:13px;color:var(--st-muted);padding:12px 0;}nav a[aria-current]{color:var(--st-gold);}
  .actions{display:flex;align-items:center;gap:16px;}.locale{font-size:11px;letter-spacing:1.1px;color:var(--st-gold);}
  .signin{border:1px solid var(--st-line);border-radius:999px;padding:10px 18px;min-height:44px;display:flex;align-items:center;gap:7px;font-size:12px;}svg{width:20px;height:20px;}
  @container saju (max-width:850px){nav{display:none;}.inner{gap:12px;}.actions{gap:12px;}.signin{padding:8px 12px;}.brand{font-size:24px;}}
`;
export default function GNB() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const { account } = useAccount();
  return <Header data-global-header><div className="inner"><Link className="brand" to="/" aria-label="SajuTeller home">SAJUTELLER</Link><nav aria-label="Desktop navigation">{navigation.map(item => <Link to={item.to} key={item.to} aria-current={item.matches(pathname) ? 'page' : undefined}>{t(item.label)}</Link>)}</nav><div className="actions"><LocaleSelector/><Link className="signin" to={account ? '/profile' : '/sign-in'}>{account ? <><UserCircleIcon/><span>{t("My profile")}</span></> : t('Sign in')}</Link></div></div></Header>;
}
