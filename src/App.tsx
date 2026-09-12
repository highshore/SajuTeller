import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout";
import { Home } from "./routes/home";
import Profile from "./routes/profile";
import { Login } from "./routes/sign_in";
import { CreateAccount } from "./routes/sign_up";
import { createGlobalStyle, styled } from "styled-components";
import reset from "styled-reset";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/loading_screen";
import { supabase } from "./supabase";
import ProtectedRoute from "./components/protected_route";
import NotFound from "./components/not_found";
import AuthCallback from "./routes/auth_callback";
import Messages from "./routes/messages.tsx";
import AdminRoute from "./components/admin_route";
import AdminBroadcast from "./routes/admin-broadcast";
import Support from "./routes/support";
import FAQ from "./routes/faq";
import LiveTranslation from "./routes/live_translation.tsx";
import Locations from "./routes/locations";
import BusinessDetail from "./routes/business_detail.tsx";
import Booking from "./routes/booking";
import Payment from "./routes/payment";
import TodayFortune from "./routes/today-fortune";
import NameCreation from "./routes/name-creation";
import { Intro } from "./routes/intro";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <Home /> },
      { path: "intro", element: <Intro /> },
      {
        path: "profile",
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
      },
      {
        path: "messages",
        element: <ProtectedRoute><Messages /></ProtectedRoute>,
      },
      {
        path: "d",
        element: <AdminRoute><AdminBroadcast /></AdminRoute>,
      },
      { path: "support", element: <Support /> },
      { path: "faq", element: <FAQ /> },
      { path: "live-translation", element: <LiveTranslation /> },
      { path: "locations", element: <Locations /> },
      { path: "today-fortune", element: <TodayFortune /> },
      { path: "name-creation", element: <NameCreation /> },
      { path: "business/:id", element: <BusinessDetail /> },
      { path: "business/:id/booking", element: <Booking /> },
      { path: "business/:id/payment", element: <Payment /> },
    ],
  },
  { path: "/sign-in", element: <Login /> },
  { path: "/sign-up", element: <CreateAccount /> },
  { path: "/sign_in", element: <Login /> },
  { path: "/sign_up", element: <CreateAccount /> },
  { path: "/auth-callback", element: <AuthCallback /> },
  { path: "/kakao-callback", element: <AuthCallback /> },
  { path: "*", element: <NotFound /> },
]);

const GlobalStyles = createGlobalStyle`
  ${reset};
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@500;600;700&family=Crimson+Text:wght@400;600&family=Noto+Sans+KR:wght@400;500;600;700&family=Noto+Serif+KR:wght@500;600;700&family=Song+Myung&display=swap');

  :root {
    --ks-midnight: #0F0026;
    --ks-night: #180A2E;
    --ks-purple: #6210CC;
    --ks-violet: #8B5CF6;
    --ks-gold: #D4AF37;
    --ks-bronze: #8B7355;
    --ks-parchment: #F8F6F0;
    --ks-paper: #FFFDF8;
    --ks-cocoa: #2C1810;
    --ks-ink: #1F2937;
    --ks-muted: #6B7280;
    --ks-line: #E8E0D5;
    --ks-radius-sm: 12px;
    --ks-radius-md: 18px;
    --ks-radius-lg: 24px;
    --ks-shadow: 0 12px 34px rgba(15, 0, 38, 0.10);
  }

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  html, body, #root { min-height: 100%; }
  body {
    margin: 0;
    background: var(--ks-paper);
    color: var(--ks-ink);
    font-family: Inter, 'Noto Sans KR', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  a { color: inherit; text-decoration: none; }
  button, input, textarea, select { font: inherit; }
  button { -webkit-tap-highlight-color: transparent; }
  ::selection { background: rgba(98, 16, 204, 0.18); }

  h1, h2, h3, h4 { text-wrap: balance; }
  p { text-wrap: pretty; }

  @media (max-width: 768px) {
    :root { --ks-radius-lg: 20px; }
  }
`;

const Wrapper = styled.div`
  min-height: 100vh;
  display: block;
  background: var(--ks-paper);
`;

function App() {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await supabase.auth.getSession();
      if (isMounted) setLoading(false);
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <Wrapper>
      <GlobalStyles />
      <RouterProvider router={router} />
      {isLoading && <LoadingScreen />}
    </Wrapper>
  );
}

export default App;
