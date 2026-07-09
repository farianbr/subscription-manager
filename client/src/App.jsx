import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SettingsPage from "./pages/SettingsPage";
import HistoryPage from "./pages/HistoryPage";
import InsightsPage from "./pages/InsightsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import Header from "./components/ui/Header";
import VerificationBanner from "./components/VerificationBanner";
import ScrollToTop from "./components/ui/ScrollToTop";
import { useQuery } from "@apollo/client/react";
import { GET_AUTHENTICATED_USER } from "./graphql/queries/user.queries";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  const { loading, data } = useQuery(GET_AUTHENTICATED_USER);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-11 h-11 border-3 border-border border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1">Subscription Manager</h2>
          <p className="text-muted">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      {data?.authUser && <Header />}
      {data?.authUser && <VerificationBanner />}
      <Routes>
        <Route
          path="/"
          element={data.authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!data.authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!data.authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/settings"
          element={
            data.authUser ? <SettingsPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/history"
          element={
            data.authUser ? <HistoryPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/insights"
          element={
            data.authUser ? <InsightsPage /> : <Navigate to="/login" />
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        {/* Public — reachable without auth for Google OAuth verification. */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
