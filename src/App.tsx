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
import NameCreation from "./routes/name-creation"; // Added import
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
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "messages",
        element: (
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        ),
      },
      {
        path: "d",
        element: (
          <AdminRoute>
            <AdminBroadcast />
          </AdminRoute>
        ),
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
  // Allow underscore variants to avoid dead links
  { path: "/sign_in", element: <Login /> },
  { path: "/sign_up", element: <CreateAccount /> },
  { path: "/auth-callback", element: <AuthCallback /> },
  // Backward-compatible alias for old links
  { path: "/kakao-callback", element: <AuthCallback /> },
  { path: "*", element: <NotFound /> },
]);

const GlobalStyles = createGlobalStyle`
  ${reset};
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    background-color: #ffffff;
    color: #111827;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  a { color: inherit; text-decoration: none; }
`;

const Wrapper = styled.div`
  min-height: 100vh;
  display: block;
`;

function App() {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;
    (async () => {
      await supabase.auth.getSession();
      if (isMounted) setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
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