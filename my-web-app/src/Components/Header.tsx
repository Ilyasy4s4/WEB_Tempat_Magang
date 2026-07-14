import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useAuthStore } from "../Store/AuthStore";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeStyle = "text-[#3b82f6] border-b-2 border-[#3b82f6] font-semibold";
  const defaultStyle = "text-slate-600 hover:text-[#3b82f6] font-medium";

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm w-full sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center w-full">

        {/* LEFT - LOGO */}
        <Link to="/" className="flex items-center gap-2 select-none">
          <span className="text-xl font-bold tracking-wide text-[#3b82f6] font-sans">TegangKu</span>
        </Link>

        {/* MIDDLE - NAV */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm py-2 transition-all duration-200 ${isActive ? activeStyle : defaultStyle}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/rekomendasi"
            className={({ isActive }) =>
              `text-sm py-2 transition-all duration-200 ${isActive ? activeStyle : defaultStyle}`
            }
          >
            Rekomendasi
          </NavLink>
          <NavLink
            to="/perusahaan"
            className={({ isActive }) =>
              `text-sm py-2 transition-all duration-200 ${isActive ? activeStyle : defaultStyle}`
            }
          >
            Perusahaan
          </NavLink>
        </nav>

        {/* RIGHT - ACTIONS */}
        {isAuthenticated && user ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer bg-transparent"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {initials(user.name) || <User size={14} />}
              </div>
              <span className="text-xs font-bold text-slate-700 max-w-[120px] truncate hidden sm:inline">
                {user.name}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[110%] w-56 bg-white border border-slate-100 rounded-2xl shadow-lg py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition cursor-pointer bg-transparent border-none text-left"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-[#3b82f6] transition">
              Masuk
            </Link>
            <Link
              to="/register"
              className="bg-[#3b82f6] text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-600 transition active:scale-95"
            >
              Daftar
            </Link>
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;