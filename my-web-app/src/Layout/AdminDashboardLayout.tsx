import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuthStore } from "../Store/AuthStore";
import { 
  LayoutDashboard, 
  Layers,
  ClipboardList,
  Building2,
  LogOut, 
  Bell, 
  Mail,
  GraduationCap
} from "lucide-react";

export default function AdminDashboardLayout() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    alert("Logout berhasil!");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all duration-200 rounded-xl mx-4 select-none ${
      isActive 
        ? "text-[#0252c7] bg-blue-50/60 font-black" 
        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 font-semibold"
    }`;

  return (
    <div className="flex w-full min-h-screen bg-slate-50/50 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-white text-slate-700 flex flex-col min-h-screen sticky top-0 border-r border-slate-200/60 select-none">
        
        {/* Brand Logo */}
        <div className="px-8 py-7">
          <h1 className="text-[#0252c7] text-lg font-black tracking-tight leading-none">
            Tegangku
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Admin Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 mt-2">
          <NavLink to="/admin" end className={navLinkClass}>
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/bidang" className={navLinkClass}>
            <Layers size={15} />
            <span>Bidang</span>
          </NavLink>

          <NavLink to="/admin/kriteria" className={navLinkClass}>
            <ClipboardList size={15} />
            <span>Kriteria</span>
          </NavLink>

          <NavLink to="/admin/perusahaan" className={navLinkClass}>
            <Building2 size={15} />
            <span>Perusahaan</span>
          </NavLink>

          <NavLink to="/admin/universitas" className={navLinkClass}>
            <GraduationCap size={15} />
            <span>Universitas</span>
          </NavLink>
        </nav>

        {/* Divider */}
        <div className="mx-8 my-4 border-t border-slate-100"></div>

        {/* Logout */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl mx-4 transition cursor-pointer select-none border-none text-left bg-transparent"
            type="button"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>

        {/* Spacer */}
        <div className="mt-auto p-6"></div>

      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="h-[72px] bg-white border-b border-slate-200/50 sticky top-0 flex justify-end items-center px-8 z-20 shadow-xs select-none">
          <div className="flex items-center gap-6">
            
            {/* Action Icons */}
            <div className="flex items-center gap-3 pr-5 border-r border-slate-100 text-slate-400">
              <button 
                type="button"
                className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition cursor-pointer border-none bg-transparent"
                title="Notifications"
              >
                <Bell size={16} />
              </button>
              <button 
                type="button"
                className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition cursor-pointer border-none bg-transparent"
                title="Messages"
              >
                <Mail size={16} />
              </button>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-extrabold text-slate-800 leading-none">Admin User</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black select-none border border-blue-200/50">
                AD
              </div>
            </div>

          </div>
        </header>

        {/* Content */}
        <main className="flex-grow p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
