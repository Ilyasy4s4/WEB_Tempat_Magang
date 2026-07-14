import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBidangStore } from "../../../Store/BidangStore";
import { usePerusahaanAdminStore } from "../../../Store/PerusahaanAdminStore";
import { useAuthStore } from "../../../Store/AuthStore";
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Building2,
  Search,
  Loader2,
} from "lucide-react";

export default function BidangIndex() {
  const navigate = useNavigate();
  const bidangList = useBidangStore((s) => s.bidangList);
  const loading = useBidangStore((s) => s.loading);
  const error = useBidangStore((s) => s.error);
  const fetchBidang = useBidangStore((s) => s.fetchBidang);
  const deleteBidang = useBidangStore((s) => s.deleteBidang);

  const perusahaanList = usePerusahaanAdminStore((s) => s.perusahaanList);
  const fetchPerusahaan = usePerusahaanAdminStore((s) => s.fetchPerusahaan);

  // Bidang bersifat global lintas kampus, jadi hanya Super Admin yang boleh
  // menambah/mengubah/menghapus. Admin kampus hanya bisa melihat (read-only).
  const role = useAuthStore((s) => s.user?.role);
  const canManage = role === "super_admin";

  useEffect(() => {
    fetchBidang();
    fetchPerusahaan();
  }, [fetchBidang, fetchPerusahaan]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus bidang "${name}"?`)) {
      try {
        await deleteBidang(id);
      } catch (err: any) {
        alert(err.message || "Gagal menghapus bidang.");
      }
    }
  };

  const jumlahPerusahaan = (bidangId: string) =>
    perusahaanList.filter((p) => p.bidangId === bidangId).length;

  const totalPerusahaan = perusahaanList.length;

  return (
    <div className="flex flex-col gap-8 font-sans w-full select-none">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <span>Dashboard</span><span>/</span><span className="text-[#3b82f6]">Bidang</span>
          </nav>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">Manajemen Bidang</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {canManage
              ? "Kelola daftar bidang/industri untuk klasifikasi perusahaan mitra."
              : "Daftar bidang/industri bersifat global dan dikelola oleh Super Admin."}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => navigate("/dashboard/bidang/create")}
            className="bg-[#2563eb] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-blue-600 active:scale-95 transition cursor-pointer border-none"
          >
            <Plus size={14} /> Tambah Bidang
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Layers size={20} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Bidang</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{bidangList.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><Building2 size={20} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Perusahaan</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{totalPerusahaan}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-xl"><Search size={20} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rata-rata / Bidang</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{bidangList.length ? Math.round(totalPerusahaan / bidangList.length) : 0}</h3>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xs font-extrabold text-slate-700">Daftar Bidang</h3>
          <span className="text-[10px] font-bold text-slate-400">{bidangList.length} bidang</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-50/75 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Bidang</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 text-center">Jumlah Perusahaan</th>
                {canManage && <th className="px-6 py-4 w-24 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {loading && (
                <tr><td colSpan={canManage ? 4 : 3} className="text-center py-16 text-slate-400 font-bold text-sm">
                  <Loader2 size={18} className="animate-spin inline-block mr-2" /> Memuat data...
                </td></tr>
              )}
              {!loading && bidangList.length === 0 && (
                <tr><td colSpan={canManage ? 4 : 3} className="text-center py-16 text-slate-400 font-bold text-sm">Belum ada data bidang.</td></tr>
              )}
              {!loading && bidangList.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${b.iconBg}`}>
                      <Layers size={14} />
                    </div>
                    <span className="font-bold text-slate-800">{b.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{b.slug}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-800">{jumlahPerusahaan(b.id)}</td>
                  {canManage && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/dashboard/bidang/edit/${b.id}`)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer bg-transparent border-none" title="Edit">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDelete(b.id, b.name)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition cursor-pointer bg-transparent border-none" title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
