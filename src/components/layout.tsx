import LoadingScreen from './loading_screen';
import { useI18n } from '../i18n/i18n';
import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { styled } from "styled-components";
import GNB from "./gnb";
import Footer from "./footer";
import MobileNavigation from "./mobile_navigation";
import { siteLayout } from "./navigation";

const Shell = styled.div<{ $mobileDock: boolean; $wide: boolean }>`
  container: saju / inline-size;
  max-width: ${p => p.$wide ? "none" : "var(--st-app-width)"};
  margin-inline: auto;
  box-shadow: 0 0 0 1px var(--st-line);
  padding-bottom: ${p => p.$mobileDock ? "calc(76px + env(safe-area-inset-bottom))" : "0"};
  --ks-header-height: 60px;
  width: 100%;
  min-width: 0;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--ks-paper);
`;
const Main = styled.main`
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--ks-paper);
`;

export default function Layout() {const { t } = useI18n();
  const { pathname, search } = useLocation();
  const policy = siteLayout(pathname);
  const chatRoom = pathname === "/messages" && (new URLSearchParams(search).has("channel") || new URLSearchParams(search).has("studio"));
  if (chatRoom) { policy.header = false; policy.footer = false; policy.bottomNav = false; }
  useEffect(() => { window.scrollTo({ top:0, left:0, behavior:"instant" }); }, [pathname]);
  return <Shell data-app-shell $mobileDock={policy.bottomNav} $wide={policy.wide}><a href="#main-content" className="skip-link">{t("Skip to content")}</a>{policy.header && <GNB/>}<Main id="main-content"><Suspense fallback={<LoadingScreen/>}><Outlet/></Suspense></Main>{policy.footer && <Footer compact={policy.compactFooter}/>}{policy.bottomNav&&<MobileNavigation/>}</Shell>;
}
