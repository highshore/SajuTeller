import { NotificationProvider } from './components/notification-provider';
import LoadingScreen from './components/loading_screen';
import { lazy, Suspense } from "react";
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/layout";
import { Home } from "./routes/home";
const Profile = lazy(() => import("./routes/account"));
import { Login } from "./routes/sign_in";
import { CreateAccount } from "./routes/sign_up";
import { createGlobalStyle, styled } from "styled-components";
import reset from "styled-reset";
import ProtectedRoute from "./components/protected_route";
import NotFound from "./components/not_found";
import AuthCallback from "./routes/auth_callback";
const Messages = lazy(() => import("./routes/messages.tsx"));
import AdminRoute from "./components/admin_route";
const AdminNotifications = lazy(() => import("./routes/admin-notifications"));
const Notifications = lazy(() => import("./routes/notifications"));
const Support = lazy(() => import("./routes/support"));
const FAQ = lazy(() => import("./routes/faq"));
const LiveTranslation = lazy(() => import("./routes/live_translation.tsx"));
const Locations = lazy(() => import("./routes/reading-map"));
const BusinessDetail = lazy(() => import("./routes/experience"));
const Booking = lazy(() => import("./routes/request-visit"));

const TodayFortune = lazy(() => import("./routes/today-fortune"));
const NameCreation = lazy(() => import("./routes/name-creation"));
const Learn = lazy(() => import("./routes/learn"));
const Experiences = lazy(() => import("./routes/experiences"));
const Match = lazy(() => import("./routes/match"));
const Saved = lazy(() => import("./routes/saved"));
const Trips = lazy(() => import("./routes/trips"));
const Host = lazy(() => import("./routes/host"));
const Search = lazy(() => import("./routes/search"));
const Studio = lazy(() => import("./routes/studio"));
const Onboarding = lazy(() => import("./routes/onboarding"));
const Legal = lazy(() => import("./routes/legal"));
import AuthFlow from "./components/auth-flow";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <Home /> },
      { path: "/sign-in", element: <Login /> },
      { path: "/sign-up", element: <CreateAccount /> },
      { path: "/sign_in", element: <Login /> },
      { path: "/sign_up", element: <CreateAccount /> },
      { path: "/auth-callback", element: <AuthCallback /> },
      { path: "/kakao-callback", element: <AuthCallback /> },

      { path: "intro", element: <Navigate to="/learn" replace /> },
      { path: "learn", element: <Learn /> },
      { path: "learn/:slug", element: <Learn /> },
      { path: "experiences", element: <Experiences /> },
      { path: "search", element: <Search /> },
      { path: "studio", element: <Studio /> },
      { path: "onboarding", element: <ProtectedRoute><Onboarding /></ProtectedRoute> },
      { path: "reset-password", element: <ProtectedRoute><AuthFlow initialMode="reset"/></ProtectedRoute> },
      ...["privacy","terms","refund-policy"].map(path=>({path,element:<Legal/>})),
      { path: "find-my-reading", element: <Match /> },
      { path: "saved", element: <Saved /> },
      { path: "trips", element: <Trips /> },
      { path: "host", element: <Host /> },
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "messages", element: <ProtectedRoute><Messages /></ProtectedRoute> },
      { path: "notifications", element: <ProtectedRoute><Notifications /></ProtectedRoute> },
      { path: "admin/notifications", element: <AdminRoute><AdminNotifications /></AdminRoute> },
      { path: "d", element: <Navigate to="/admin/notifications" replace/> },
      { path: "support", element: <Support /> },
      { path: "faq", element: <FAQ /> },
      { path: "live-translation", element: <LiveTranslation /> },
      { path: "locations", element: <Navigate to="/experiences" replace /> },
      { path: "map", element: <Locations /> },
      { path: "today-fortune", element: <TodayFortune /> },
      { path: "name-creation", element: <NameCreation /> },
      { path: "business", element: <Navigate to="/experiences" replace /> },
      { path: "business/:id", element: <BusinessDetail /> },
      { path: "business/:id/booking", element: <Booking /> },
      { path: "business/:id/payment", element: <Booking /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

const GlobalStyles = createGlobalStyle`
  ${reset};

  :root {
    --st-app-width:430px;
    --st-backdrop:#17111e;
    --st-paper:#0b0610;
    --st-surface:#130a1b;
    --st-elevated:#1c1027;
    --st-accent:#4b2d5a;
    --st-accent-line:#6c447c;
    --st-gold:#c9a76a;
    --st-ink:#f4eee7;
    --st-muted:#b8acbf;
    --st-line:#2b1a33;
    --st-lilac:#4b2d5a;
    --ks-header-height: 72px;
    --ks-midnight: #0F0026;
    --ks-night: #180A2E;
    --ks-purple: #79608b;
    --ks-violet: #8B5CF6;
    --ks-gold: #D4AF37;
    --ks-bronze: #8B7355;
    --ks-parchment: #F8F6F0;
    --ks-paper: var(--st-paper);
    --ks-cocoa: #2C1810;
    --ks-ink: var(--st-ink);
    --ks-muted: #6B7280;
    --ks-line: #E8E0D5;
    --ks-radius-sm: 12px;
    --ks-radius-md: 18px;
    --ks-radius-lg: 24px;
    --ks-shadow: 0 12px 34px rgba(15, 0, 38, 0.10);
  }

  * { box-sizing: border-box; }
  .skip-link{clip-path:inset(50%);position:fixed;top:-60px;left:max(16px,calc((100% - var(--st-app-width))/2 + 16px));z-index:1000;padding:12px 18px;background:var(--st-gold);color:var(--st-paper);border-radius:10px;}
  .skip-link:focus{top:8px;clip-path:none;}
  img, video { max-width:100%; height:auto; }
  input, select, textarea { max-width:100%; min-width:0; }
  :focus-visible { outline:2px solid #a78bfa; outline-offset:3px; }
  html { scroll-behavior: smooth; scroll-padding-top:76px; scroll-padding-bottom:calc(88px + env(safe-area-inset-bottom)); }
  html, body, #root { min-height: 100%; }
  body {
    margin: 0;
    background: var(--st-backdrop);
    color: var(--ks-ink);
    font-family: Inter, 'Noto Sans KR', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  a { color: inherit; text-decoration: none; }
  button, input, textarea, select { font: inherit; }
  button { -webkit-tap-highlight-color: transparent; }
  input,select,textarea { color-scheme:dark; }
  ::selection { background: rgba(98, 16, 204, 0.18); }
  h1, h2, h3, h4 { text-wrap: balance; }
  p { text-wrap: pretty; }

  @media (prefers-reduced-motion:reduce) { html { scroll-behavior:auto; } }

  @container saju (max-width: 850px) {
    input, select, textarea { font-size:16px !important; }
    button { touch-action:manipulation; }
  }
`;

const Wrapper = styled.div`
  min-height: 100vh;
  display: block;
  background: var(--st-backdrop);
`;

function App() {
  return (
    <Wrapper>
      <GlobalStyles />
      <Suspense fallback={<LoadingScreen/>}><NotificationProvider><RouterProvider router={router} /></NotificationProvider></Suspense>
    </Wrapper>
  );
}

export default App;
