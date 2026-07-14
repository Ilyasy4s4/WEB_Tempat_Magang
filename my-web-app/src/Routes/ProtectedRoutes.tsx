import { useAuthStore } from "../Store/AuthStore";
import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "../lib/api";

interface ProtectedRoutesProps {
  // Kalau diisi, hanya role yang ada di daftar ini yang boleh masuk.
  // Kalau kosong/tidak diisi, cukup syarat "sudah login" (dipakai apa adanya
  // supaya pemakaian lama <ProtectedRoutes /> di App.tsx tetap jalan).
  allowedRoles?: Role[];
}

export default function ProtectedRoutes({ allowedRoles }: ProtectedRoutesProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Kalau route ini dibatasi role tertentu (misal /dashboard hanya admin/super_admin)
  // dan role user tidak termasuk, tendang balik ke halaman utama.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
