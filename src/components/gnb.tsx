import { useNotifications } from '../product/notifications';
import LocaleSelector from './locale-selector';
import { useI18n } from '../i18n/i18n';
import { Link, useLocation } from 'react-router-dom';
import { styled } from 'styled-components';
import { UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAccount } from '../product/data';
import { navigation, nightRoute } from './navigation';

const Header = styled.header`
  position:sticky;top:0;z-index:100;height:var(--ks-header-height);background:var(--st-nav-bg);color:var(--st-ink);backdrop-filter:blur(18px);border-bottom:1px solid var(--st-line);
  .inner{width:min(1160px,calc(100% - 32px));margin:auto;height:100%;display:flex;align-items:center;justify-content:space-between;gap:24px;}
  .brand{font:500 26px/30px 'Cormorant Garamond',serif;letter-spacing:.4px;white-space:nowrap;min-width:0;overflow:hidden;text-overflow:ellipsis;}
  nav{display:flex;align-items:center;gap:28px;}nav a{font-size:13px;color:var(--st-muted);padding:12px 0;}nav a[aria-current]{color:var(--st-gold);}
  .actions{display:flex;align-items:center;gap:12px;flex-shrink:0;}.locale{font-size:11px;letter-spacing:1.1px;color:var(--st-gold);}
  .signin{border:1px solid var(--st-line);border-radius:999px;padding:10px 18px;min-height:44px;display:flex;align-items:center;justify-content:center;gap:7px;font-size:12px;white-space:nowrap;}.signin-mobile-icon{display:none;}svg{width:20px;height:20px;}
  .bell{width:44px;height:44px;flex:none;position:relative;display:grid;place-items:center;border:1px solid var(--st-line);border-radius:50%;}.badge{position:absolute;top:1px;right:0;min-width:16px;height:16px;border-radius:99px;padding:0 3px;background:var(--st-action);color:var(--st-on-action);font-size:9px;font-weight:700;display:grid;place-items:center;}
  @container saju (max-width:850px){nav{display:none;}.inner{gap:8px;}.actions{gap:6px;}.signin{width:44px;height:44px;min-height:44px;flex-shrink:0;padding:0;border-radius:50%;}.signin span{display:none;}.signin-mobile-icon{display:block;}.brand{font-size:22px;}}@container saju (max-width:350px){.brand{font-size:19px;}.inner{width:calc(100% - 24px);}.actions{gap:5px;}.signin,.bell{width:42px;height:42px;min-height:42px;}}
`;
export default function GNB() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const { account } = useAccount();
  const { unread } = useNotifications();
  return <Header data-global-header className={nightRoute(pathname) ? 'st-night' : undefined}><div className="inner"><Link className="brand" to="/" aria-label="SajuTeller home">SAJUTELLER</Link><nav aria-label="Desktop navigation">{navigation.map(item => <Link to={item.to} key={item.to} aria-current={item.matches(pathname) ? 'page' : undefined}>{t(item.label)}</Link>)}</nav><div className="actions"><LocaleSelector/>{account&&<Link className="bell" to="/notifications" aria-label={t("Notifications")}><BellIcon/>{unread>0&&<span className="badge">{unread>99?"99+":unread}</span>}</Link>}<Link className="signin" aria-label={t(account?"My profile":"Sign in")} to={account ? '/profile' : '/sign-in'}>{account ? <><UserCircleIcon/><span>{t("My profile")}</span></> : <><UserCircleIcon className="signin-mobile-icon"/><span>{t('Sign in')}</span></>}</Link></div></div></Header>;
}
