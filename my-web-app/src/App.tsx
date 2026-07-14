import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import SplashScreen from "./Components/UI/SplashScreen";
import RegisterForm from "./Pages/RegisterForm";
import LoginForm from "./Pages/LoginForm";
import Beranda from "./Pages/Beranda";
import DetailPerusahaan from "./Pages/DetailPerusahaan";

import MainLayout from "./Layout/MyLayout";
import AuthLayouts from "./Layout/AuthLayout";
import ProtectedRoutes from "./Routes/ProtectedRoutes";
import DashboardIndexSuper from "./dashboard/SuperAdmin/DashboardIndex";
import DashboardLayouts from "./Layout/DashboardLayout";
import Rekomendasi from "./Pages/Rekomendasi";
import Universitas from "./dashboard/SuperAdmin/Universitas/UniversitasIndex";
import CreateUniversitas from "./dashboard/SuperAdmin/Universitas/CreateUniversitas";
import UpdateUniversitas from "./dashboard/SuperAdmin/Universitas/UpdateUniversitas";
import SistemPendukungKeputusan from "./dashboard/Admin/SistemPendukungKeputusan";
import Perusahaan from "./Pages/Perusahaan";
import Pengguna from "./dashboard/SuperAdmin/Pengguna";
import Lowongan from "./dashboard/SuperAdmin/Lowongan";
import Ulasan from "./dashboard/SuperAdmin/Ulasan";
import Settings from "./dashboard/SuperAdmin/Settings";

// Admin Imports
import DashboardIndexAdmin from "./dashboard/Admin/DashboardAdminIndex";
import BidangIndex from "./dashboard/Admin/Bidang/BidangIndex";
import CreateBidang from "./dashboard/Admin/Bidang/CreateBidang";
import UpdateBidang from "./dashboard/Admin/Bidang/UpdateBidang";
import KriteriaIndex from "./dashboard/Admin/Kriteria/KriteriaIndex";
import CreateKriteria from "./dashboard/Admin/Kriteria/CreateKriteria";
import UpdateKriteria from "./dashboard/Admin/Kriteria/UpdateKriteria";
import PerusahaanIndex from "./dashboard/Admin/Perusahaan/PerusahaanIndex";
import CreatePerusahaan from "./dashboard/Admin/Perusahaan/CreatePerusahaan";
import UpdatePerusahaan from "./dashboard/Admin/Perusahaan/UpadatePerusahan";
import NilaiKriteriaPerusahaan from "./dashboard/Admin/Perusahaan/NilaiKriteriaPerusahaan";

// Super Admin -> Admin CRUD Imports
import AdminIndex from "./dashboard/SuperAdmin/Admin/AdminIndex";
import CreateAdmin from "./dashboard/SuperAdmin/Admin/CreateAdmin";
import UpdateAdmin from "./dashboard/SuperAdmin/Admin/UpdateAdmin";

import { useAuthStore } from "./Store/AuthStore";

// Menampilkan dashboard index yang berbeda tergantung role.
// PENTING: value role sekarang mengikuti persis enum di backend
// (super_admin / admin / mahasiswa), bukan "superadmin" tanpa underscore.
function DynamicDashboardIndex() {
  const user = useAuthStore((state) => state.user);
  if (user?.role === "admin") {
    return <DashboardIndexAdmin />;
  }
  return <DashboardIndexSuper />;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Routes>
        {/* PUBLIC (termasuk mahasiswa yang sudah login - dia tetap di sini) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Beranda />} />
          <Route path="/rekomendasi" element={<Rekomendasi />} />
          <Route path="/perusahaan" element={<Perusahaan />} />
          <Route path="/perusahaan/:id" element={<DetailPerusahaan />} />
        </Route>

        {/* AUTH */}
        <Route element={<AuthLayouts />}>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
        </Route>

        {/* DASHBOARD - hanya admin & super_admin, mahasiswa ditolak balik ke "/" */}
        <Route element={<ProtectedRoutes allowedRoles={["admin", "super_admin"]} />}>
          <Route element={<DashboardLayouts />}>
            <Route path="/dashboard" element={<DynamicDashboardIndex />} />
            <Route path="/dashboard/pengguna" element={<Pengguna />} />
            <Route path="/dashboard/lowongan" element={<Lowongan />} />
            <Route path="/dashboard/ulasan" element={<Ulasan />} />
            <Route path="/dashboard/settings" element={<Settings />} />

            {/* Universitas Routes (CRUD Kampus) */}
            <Route path="/dashboard/universitas" element={<Universitas />} />
            <Route path="/dashboard/universitas/create" element={<CreateUniversitas />} />
            <Route path="/dashboard/universitas/edit/:id" element={<UpdateUniversitas />} />

            {/* Admin Management Routes (CRUD Admin) */}
            <Route path="/dashboard/admin-management" element={<AdminIndex />} />
            <Route path="/dashboard/admin-management/create" element={<CreateAdmin />} />
            <Route path="/dashboard/admin-management/edit/:id" element={<UpdateAdmin />} />

            {/* Bidang Routes */}
            <Route path="/dashboard/bidang" element={<BidangIndex />} />
            <Route path="/dashboard/bidang/create" element={<CreateBidang />} />
            <Route path="/dashboard/bidang/edit/:id" element={<UpdateBidang />} />

            {/* Kriteria Routes */}
            <Route path="/dashboard/kriteria" element={<KriteriaIndex />} />
            <Route path="/dashboard/kriteria/create" element={<CreateKriteria />} />
            <Route path="/dashboard/kriteria/edit/:id" element={<UpdateKriteria />} />

            {/* Perusahaan Admin Routes */}
            <Route path="/dashboard/manajemen-perusahaan" element={<PerusahaanIndex />} />
            <Route path="/dashboard/manajemen-perusahaan/create" element={<CreatePerusahaan />} />
            <Route path="/dashboard/manajemen-perusahaan/edit/:id" element={<UpdatePerusahaan />} />
            <Route path="/dashboard/manajemen-perusahaan/nilai/:id" element={<NilaiKriteriaPerusahaan />} />

            <Route path="/dashboard/spk" element={<SistemPendukungKeputusan />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;