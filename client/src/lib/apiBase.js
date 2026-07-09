// Base origin of the API/server. Same-origin in production; the dev server runs
// on :4000 while Vite serves the client on :5173. Mirrors the Apollo HttpLink
// logic in main.jsx. Used for full-page navigations the SPA can't proxy (OAuth).
export const API_BASE =
  import.meta.env.VITE_NODE_ENV === "development" ? "http://localhost:4000" : "";

export const GOOGLE_CALENDAR_CONNECT_URL = `${API_BASE}/auth/google/calendar`;
