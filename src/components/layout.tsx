import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { styled } from "styled-components";
import GNB from "./gnb";
import Footer from "./footer";
import MobileNavigation from "./mobile_navigation";
import { hasMobileNavigation } from "./mobile_navigation_routes";

const Shell = styled.div<{ $mobileDock: boolean }>`
  @media(max-width:768px){padding-bottom:${p => p.$mobileDock ? "calc(88px + env(safe-area-inset-bottom))" : "0"};}
  width: 100%;
  min-height: 100vh;
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

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top:0, left:0, behavior:"instant" }); }, [pathname]);
  return <Shell $mobileDock={hasMobileNavigation(pathname)}><GNB/><Main><Outlet/></Main><Footer/><MobileNavigation/></Shell>;
}
