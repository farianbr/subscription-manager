import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { MdLogout, MdHistory, MdInsights } from "react-icons/md";
import { IoSettingsSharp, IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { useMutation, useQuery } from "@apollo/client/react";
import { LOGOUT } from "../../graphql/mutations/user.mutation";
import { GET_AUTHENTICATED_USER } from "../../graphql/queries/user.queries";
import NotificationBell from "../NotificationBell";
import { useTheme } from "../../context/ThemeContext";

const iconButton =
  "p-2 text-muted hover:text-foreground hover:bg-surface-2 rounded-full transition-colors duration-200";

const Header = () => {
  const { data: authUserData } = useQuery(GET_AUTHENTICATED_USER);
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [logout, { loading, client }] = useMutation(LOGOUT, {
    refetchQueries: ["GET_AUTHENTICATED_USER"],
  });

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    // Keep the menu open so the button's loading spinner is visible; the header
    // unmounts on success when the auth query clears.
    try {
      await logout();
      client.resetStore();
    } catch (err) {
      console.error(err.message);
    }
  };

  const user = authUserData?.authUser;
  const initials =
    user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const menuItem =
    "flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-surface-2 transition-colors";

  const navLink = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full text-sm font-medium transition-colors ${
      isActive
        ? "bg-surface-2 text-foreground"
        : "text-muted hover:text-foreground hover:bg-surface-2"
    }`;

  return (
    <header className="bg-surface/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
            <img src="/favicon/favicon.svg" alt="Logo" className="w-7 h-7 shrink-0" />
            <span className="text-base sm:text-[17px] font-semibold tracking-tight text-foreground truncate">
              Subscription Manager
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            {/* Primary nav */}
            <nav className="flex items-center gap-0.5 sm:gap-1 mr-0.5 sm:mr-1">
              <NavLink to="/insights" className={navLink} title="Insights">
                <MdInsights className="w-5 h-5" aria-hidden="true" />
                <span className="hidden md:inline">Insights</span>
              </NavLink>
              <NavLink to="/history" className={navLink} title="History">
                <MdHistory className="w-5 h-5" aria-hidden="true" />
                <span className="hidden md:inline">History</span>
              </NavLink>
            </nav>

            <button onClick={toggleTheme} className={iconButton} title="Toggle theme" aria-label="Toggle theme">
              {theme === "dark" ? (
                <IoSunnyOutline className="w-5 h-5" />
              ) : (
                <IoMoonOutline className="w-5 h-5" />
              )}
            </button>

            <NotificationBell />

            {/* Profile menu */}
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                title="Account"
                aria-label="Account menu"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    className="w-9 h-9 rounded-full object-cover border border-border"
                    alt="Profile"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center font-semibold text-sm">
                    {initials}
                  </div>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-surface rounded-xl shadow-lg border border-border overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.name || "Account"}</p>
                    {user?.email && <p className="text-xs text-muted truncate">{user.email}</p>}
                  </div>
                  <div className="py-1">
                    <Link to="/settings" onClick={() => setMenuOpen(false)} className={menuItem}>
                      <IoSettingsSharp className="w-5 h-5 text-muted" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className={`${menuItem} text-red-500 hover:bg-red-500/10 disabled:opacity-50`}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-border border-t-red-500 rounded-full animate-spin"></div>
                      ) : (
                        <MdLogout className="w-5 h-5" />
                      )}
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
