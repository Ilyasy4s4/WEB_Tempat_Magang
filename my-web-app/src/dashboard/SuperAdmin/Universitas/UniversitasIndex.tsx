import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUniversitasStore } from "../../../Store/UniversitasStore";
import {
  GraduationCap,
  Mail,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

export default function UniversitasIndex() {
  const navigate = useNavigate();
  const universities = useUniversitasStore((s) => s.universities);
  const loading = useUniversitasStore((s) => s.loading);
  const error = useUniversitasStore((s) => s.error);
  const fetchUniversities = useUniversitasStore((s) => s.fetchUniversities);
  const deleteUniversity = useUniversitasStore((s) => s.deleteUniversity);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  const activeCount = universities.filter((u) => u.subscriptionStatus === "active").length;
  const trialCount = universities.filter((u) => u.subscriptionStatus === "trial").length;
  const expiredCount = universities.filter((u) => u.subscriptionStatus === "expired").length;

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kampus "${name}"?`)) {
      try {
        await deleteUniversity(id);
      } catch (err: any) {
        alert(err.message || "Gagal menghapus universitas.");
      }
    }
  };

  const statusBadge = (status: string) => {
    if (status === "active") return { label: "Aktif", cls: "bg-green-50 text-green-600", icon: <CheckCircle2 size={10} /> };
    if (status === "expired") return { label: "Expired", cls: "bg-red-50 text-red-500", icon: <XCircle size={10} /> };
    return { label: "Trial", cls: "bg-amber-50 text-amber-600", icon: <Clock size={10} /> };
  };

  return (
    <div className="flex flex-col gap-8 font-sans w-full relative select-none">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <span>Dashboard</span><span>/</span><span className="text-[#3b82f6]">Universitas</span>
          </nav>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
            Manajemen Universitas (Kampus)
          </h2>
          <p className="text-xs lg:text-sm text-slate-400 font-medium mt-1 max-w-2xl">
            Kelola daftar kampus mitra yang terdaftar sebagai tenant di platform.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/universitas/create")}
          className="bg-[#2563eb] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-blue-600 active:scale-95 transition cursor-pointer border-none"
        >
          <Plus size={14} />
          <span>Tambah Universitas</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-blue-50 text-[#3b82f6] p-3 rounded-xl"><GraduationCap size={20} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Kampus</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{universities.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-green-50 text-green-600 p-3 rounded-xl"><CheckCircle2 size={20} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aktif</span>
            <h3 className="text-2xl font-extrabold text-green-600">{activeCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl"><Clock size={20} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trial</span>
            <h3 className="text-2xl font-extrabold text-amber-600">{trialCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-red-50 text-red-500 p-3 rounded-xl"><XCircle size={20} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expired</span>
            <h3 className="text-2xl font-extrabold text-red-500">{expiredCount}</h3>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xs font-extrabold text-slate-700">Daftar Universitas</h3>
          <span className="text-[10px] font-bold text-slate-400">{universities.length} kampus</span>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead className="bg-slate-50/75 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Kampus</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 w-24 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {loading && (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400 font-bold text-sm">
                  <Loader2 size={18} className="animate-spin inline-block mr-2" /> Memuat data...
                </td></tr>
              )}
              {!loading && universities.length === 0 && (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400 font-bold text-sm">
                  Belum ada data universitas. Klik "Tambah Universitas" untuk menambahkan.
                </td></tr>
              )}
              {!loading && universities.map((uni) => {
                const badge = statusBadge(uni.subscriptionStatus);
                return (
                  <tr key={uni.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${uni.iconBg}`}>
                        {uni.iconLetter}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{uni.name}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{uni.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span className="flex items-center gap-1"><Mail size={10} /> {uni.email}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {uni.address}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${badge.cls}`}>
                        {badge.icon} {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/universitas/edit/${uni.id}`)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg transition cursor-pointer border-none bg-transparent"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(uni.id, uni.name)}
                          className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg transition cursor-pointer border-none bg-transparent"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
