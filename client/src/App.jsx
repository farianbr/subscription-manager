import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/ui/Header";
import VerificationBanner from "./components/VerificationBanner";
import ScrollToTop from "./components/ui/ScrollToTop";
import { useQuery } from "@apollo/client/react";
import { GET_AUTHENTICATED_USER } from "./graphql/queries/user.queries";
import { Toaster } from "react-hot-toast";
import "./App.css";

// Route-level code splitting: the chart-heavy dashboard/insights pages and the
// rarely-visited auth pages each load on demand instead of bloating the initial
// bundle.
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-9 h-9 border-3 border-border border-t-accent rounded-full animate-spin"></div>
    </div>
  );
}

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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
