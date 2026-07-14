import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePerusahaanAdminStore } from "../../../Store/PerusahaanAdminStore";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  SlidersHorizontal
} from "lucide-react";

export default function PerusahaanIndex() {
  const navigate = useNavigate();
  const perusahaanList = usePerusahaanAdminStore((s) => s.perusahaanList);
  const loading = usePerusahaanAdminStore((s) => s.loading);
  const error = usePerusahaanAdminStore((s) => s.error);
  const fetchPerusahaan = usePerusahaanAdminStore((s) => s.fetchPerusahaan);
  const deletePerusahaan = usePerusahaanAdminStore((s) => s.deletePerusahaan);

  useEffect(() => {
    fetchPerusahaan();
  }, [fetchPerusahaan]);

  const activeCount = perusahaanList.filter((p) => p.status === "Aktif").length;
  const inactiveCount = perusahaanList.filter((p) => p.status === "Non-Aktif").length;

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus perusahaan "${name}"?`)) {
      try {
        await deletePerusahaan(id);
      } catch (err: any) {
        alert(err.message || "Gagal menghapus perusahaan.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans w-full select-none">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <span>Dashboard</span><span>/</span><span className="text-[#3b82f6]">Perusahaan</span>
          </nav>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">Manajemen Perusahaan</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Kelola data perusahaan mitra untuk program magang dan rekrutmen.</p>
        </div>
        <button 
          onClick={() => navigate("/dashboard/manajemen-perusahaan/create")}
          className="bg-[#2563eb] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-blue-600 active:scale-95 transition cursor-pointer border-none"
        >
          <Plus size={14} /> Tambah Perusahaan
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Building2 size={20} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Perusahaan</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{perusahaanList.length}</h3>
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
          <div className="bg-slate-100 text-slate-500 p-3 rounded-xl"><XCircle size={20} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Non-Aktif</span>
            <h3 className="text-2xl font-extrabold text-slate-500">{inactiveCount}</h3>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xs font-extrabold text-slate-700">Daftar Perusahaan</h3>
          <span className="text-[10px] font-bold text-slate-400">{perusahaanList.length} perusahaan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead className="bg-slate-50/75 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Perusahaan</th>
                <th className="px-6 py-4">Bidang</th>
                <th className="px-6 py-4">Lokasi</th>
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
              {!loading && perusahaanList.length === 0 && (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400 font-bold text-sm">Belum ada data perusahaan.</td></tr>
              )}
              {!loading && perusahaanList.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ${p.iconBg}`}>
                      {p.logo ? (
                        <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        p.iconLetter
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{p.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin size={8} /> {p.workMode} · Kuota {p.kuota}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{p.bidang}</td>
                  <td className="px-6 py-4 text-slate-500">{p.lokasi}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${p.status === 'Aktif' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Aktif' ? 'bg-green-600' : 'bg-slate-400'}`}></span>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/dashboard/manajemen-perusahaan/nilai/${p.id}`)} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition cursor-pointer bg-transparent border-none" title="Nilai Kriteria">
                        <SlidersHorizontal size={12} />
                      </button>
                      <button onClick={() => navigate(`/dashboard/manajemen-perusahaan/edit/${p.id}`)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer bg-transparent border-none" title="Edit">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition cursor-pointer bg-transparent border-none" title="Delete">
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