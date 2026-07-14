import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Users, GraduationCap, Loader2 } from "lucide-react";
import { useAuthStore } from "../../Store/AuthStore";

interface MahasiswaRow {
  id: string;
  name: string;
  email: string;
  nim: string | null;
  jurusan: string | null;
  createdAt: string;
  tenantName: string;
}

function mapMahasiswa(raw: any): MahasiswaRow {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    nim: raw.nim,
    jurusan: raw.jurusan,
    createdAt: raw.created_at ? new Date(raw.created_at).toLocaleDateString("id-ID") : "-",
    tenantName: raw.tenants?.name || "-",
  };
}

export default function Pengguna() {
  const isSuperAdmin = useAuthStore((s) => s.user?.role) === "super_admin";
  const [users, setUsers] = useState<MahasiswaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getMahasiswaList();
        setUsers((res.data || []).map(mapMahasiswa));
      } catch (err: any) {
        setError(err.message || "Gagal memuat data pengguna.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-8 font-sans w-full text-slate-700 select-none">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Manajemen Pengguna
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          {isSuperAdmin
            ? "Daftar akun mahasiswa yang terdaftar di seluruh kampus mitra."
            : "Daftar akun mahasiswa yang terdaftar di kampusmu."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:max-w-xs gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Mahasiswa</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{users.length}</h3>
          </div>
          <div className="bg-blue-50 text-[#0252c7] p-3.5 rounded-2xl">
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full border-b border-slate-100 pb-5">
          <h3 className="text-sm font-bold text-slate-800">Daftar Mahasiswa</h3>
          <span className="text-[10px] font-bold text-slate-400">{users.length} pengguna</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="pb-3.5 pl-2 font-black">Nama</th>
                <th className="pb-3.5 font-black">NIM</th>
                <th className="pb-3.5 font-black">Jurusan</th>
                <th className="pb-3.5 font-black">Asal Kampus</th>
                <th className="pb-3.5 pr-2 font-black">Tgl Registrasi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400 font-bold text-sm">
                  <Loader2 size={18} className="animate-spin inline-block mr-2" /> Memuat data...
                </td></tr>
              )}
              {!loading && users.length === 0 && (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400 font-bold text-sm">
                  <GraduationCap size={20} className="inline-block mr-2 text-slate-300" />
                  Belum ada mahasiswa yang terdaftar.
                </td></tr>
              )}
              {!loading && users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-none text-xs hover:bg-slate-50/50 transition">
                  <td className="py-4 pl-2">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-slate-800 leading-none mb-1">{u.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold leading-none">{u.email}</span>
                    </div>
                  </td>
                  <td className="py-4 font-bold text-slate-500">{u.nim || "-"}</td>
                  <td className="py-4 font-bold text-slate-500">{u.jurusan || "-"}</td>
                  <td className="py-4 font-bold text-slate-500">{u.tenantName}</td>
                  <td className="py-4 pr-2 font-semibold text-slate-500">{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
