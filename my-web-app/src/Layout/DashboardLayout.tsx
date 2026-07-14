import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuthStore } from "../Store/AuthStore";
import { 
  LayoutDashboard, 
  Users,
  Briefcase,
  Building2,
  Star,
  Settings, 
  LogOut, 
  Bell, 
  Mail,
  Plus,
  Layers,
  ClipboardList,
  GraduationCap,
  Shield,
  Sliders
} from "lucide-react";

export default function DashboardLayouts() {
  const logout = useAuthStore((state) => state.logout);
  // PENTING: ambil dari state.user?.role (nilai), BUKAN state.role (itu function).
  // Sebelumnya dibandingkan ke "superadmin" padahal enum asli dari backend
  // adalah "super_admin" — jadi perbandingan ini dulu selalu false.
  const role = useAuthStore((state) => state.user?.role);
  const userName = useAuthStore((state) => state.user?.name);
  const navigate = useNavigate();
  const isSuperAdmin = role === "super_admin";

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
      
      {/* 1. SIDEBAR */}
      <aside className="w-65 bg-white text-slate-700 flex flex-col min-h-screen sticky top-0 border-r border-slate-200/60 select-none">
        
        {/* Brand Logo & Subtitle */}
        <div className="px-8 py-7">
          <h1 className="text-[#0252c7] text-lg font-black tracking-tight leading-none">
            Tegangku
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {isSuperAdmin ? "Super Admin Portal" : "Admin Portal"}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {isSuperAdmin ? (
            <>
              <NavLink to="/dashboard" end className={navLinkClass}>
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/dashboard/pengguna" className={navLinkClass}>
                <Users size={15} />
                <span>Manajemen Pengguna</span>
              </NavLink>

              <NavLink to="/dashboard/admin-management" className={navLinkClass}>
                <Shield size={15} />
                <span>Manajemen Admin</span>
              </NavLink>

              <NavLink to="/dashboard/universitas" className={navLinkClass}>
                <GraduationCap size={15} />
                <span>Universitas</span>
              </NavLink>

              <NavLink to="/dashboard/bidang" className={navLinkClass}>
                <Layers size={15} />
                <span>Bidang</span>
              </NavLink>

              <NavLink to="/dashboard/lowongan" className={navLinkClass}>
                <Briefcase size={15} />
                <span>Lowongan</span>
              </NavLink>

              <NavLink to="/dashboard/ulasan" className={navLinkClass}>
                <Star size={15} />
                <span>Ulasan & Rating</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" end className={navLinkClass}>
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/dashboard/pengguna" className={navLinkClass}>
                <Users size={15} />
                <span>Mahasiswa</span>
              </NavLink>

              <NavLink to="/dashboard/bidang" className={navLinkClass}>
                <Layers size={15} />
                <span>Bidang</span>
              </NavLink>

              <NavLink to="/dashboard/kriteria" className={navLinkClass}>
                <ClipboardList size={15} />
                <span>Kriteria</span>
              </NavLink>

              <NavLink to="/dashboard/manajemen-perusahaan" className={navLinkClass}>
                <Building2 size={15} />
                <span>Perusahaan</span>
              </NavLink>

              <NavLink to="/dashboard/spk" className={navLinkClass}>
                <Sliders size={15} />
                <span>Sistem Pendukung Keputusan</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Divider */}
        <div className="mx-8 my-4 border-t border-slate-100"></div>

        {/* Bottom Menu & Post Job Button */}
        <div className="flex flex-col gap-1.5">
          <NavLink to="/dashboard/settings" className={navLinkClass}>
            <Settings size={15} />
            <span>Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl mx-4 transition cursor-pointer select-none border-none text-left bg-transparent"
            type="button"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>

        {/* Post New Job Button only for Super Admin */}
        {isSuperAdmin && (
          <div className="mt-auto p-6">
            <button
              onClick={() => navigate("/dashboard/lowongan")}
              className="w-full bg-[#0252c7] hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-xs cursor-pointer border-none"
            >
              <Plus size={14} />
              <span>Post New Job</span>
            </button>
          </div>
        )}

      </aside>

      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Top Header Bar */}
        <header className="h-18 bg-white border-b border-slate-200/50 sticky top-0 flex justify-end items-center px-8 z-20 shadow-xs select-none">
          
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

            {/* Profile Info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-extrabold text-slate-800 leading-none">
                  {userName || (isSuperAdmin ? "Super Admin" : "Admin")}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {isSuperAdmin ? "Administrator" : "Admin"}
                </p>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256"
                alt="Admin Avatar"
                className="w-9 h-9 rounded-full border border-slate-200/50 object-cover shadow-sm select-none"
              />
            </div>

          </div>

        </header>

        {/* Main Content Area */}
        <main className="grow p-8 max-w-360 w-full mx-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}