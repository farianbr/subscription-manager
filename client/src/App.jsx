import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SettingsPage from "./pages/SettingsPage";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";
import Header from "./components/ui/Header";
import ScrollToTop from "./components/ui/ScrollToTop";
import { useQuery } from "@apollo/client/react";
import { GET_AUTHENTICATED_USER } from "./graphql/queries/user.queries";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  const { loading, data } = useQuery(GET_AUTHENTICATED_USER);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Subscription Manager</h2>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      {data?.authUser && <Header />}
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
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
