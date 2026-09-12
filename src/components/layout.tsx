
import { Outlet } from "react-router-dom";
import { styled } from "styled-components";
import GNB from "./gnb";
import Footer from "./footer";

const Shell = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1 1 auto;
  display: flex;
  min-height: 0;
`;

export default function Layout() {
  return (
    <Shell>
      <GNB />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </Shell>
  );
}
