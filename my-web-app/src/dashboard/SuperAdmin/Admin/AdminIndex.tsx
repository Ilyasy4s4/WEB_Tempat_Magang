import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../../../Store/AdminStore";
import {
  Plus,
  Edit2,
  Trash2,
  Shield,
  Calendar,
  Mail,
  Building2,
  Loader2,
} from "lucide-react";

export default function AdminIndex() {
  const navigate = useNavigate();
  const admins = useAdminStore((s) => s.admins);
  const loading = useAdminStore((s) => s.loading);
  const error = useAdminStore((s) => s.error);
  const fetchAdmins = useAdminStore((s) => s.fetchAdmins);
  const deleteAdmin = useAdminStore((s) => s.deleteAdmin);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun admin "${name}"?`)) {
      try {
        await deleteAdmin(id);
      } catch (err: any) {
        alert(err.message || "Gagal menghapus admin.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans w-full select-none text-slate-700">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <span>Super Admin</span><span>/</span><span className="text-[#3b82f6]">Manajemen Admin</span>
          </nav>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">Manajemen Admin</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Kelola akun administrator kampus yang bertugas di platform.</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/admin-management/create")}
          className="bg-[#2563eb] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-blue-600 active:scale-95 transition cursor-pointer border-none"
        >
          <Plus size={14} /> Tambah Admin
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 sm:max-w-xs">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Shield size={20} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Admin</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{admins.length}</h3>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xs font-extrabold text-slate-700">Daftar Akun Admin</h3>
          <span className="text-[10px] font-bold text-slate-400">{admins.length} admin</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50/75 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Administrator</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Kampus</th>
                <th className="px-6 py-4">Tanggal Dibuat</th>
                <th className="px-6 py-4 w-24 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {loading && (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400 font-bold text-sm">
                  <Loader2 size={18} className="animate-spin inline-block mr-2" /> Memuat data...
                </td></tr>
              )}
              {!loading && admins.length === 0 && (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400 font-bold text-sm">Belum ada data admin.</td></tr>
              )}
              {!loading && admins.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-extrabold text-xs">
                      {a.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-800">{a.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Mail size={12} className="text-slate-400" />
                      {a.email}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={12} className="text-slate-400" />
                      {a.tenantName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      {a.createdAt}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/dashboard/admin-management/edit/${a.id}`)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer bg-transparent border-none" title="Edit">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(a.id, a.name)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition cursor-pointer bg-transparent border-none" title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
