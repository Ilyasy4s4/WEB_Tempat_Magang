import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKriteriaStore } from "../../../Store/KriteriaStore";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function KriteriaIndex() {
  const navigate = useNavigate();
  const kriteriaList = useKriteriaStore((s) => s.kriteriaList);
  const loading = useKriteriaStore((s) => s.loading);
  const error = useKriteriaStore((s) => s.error);
  const fetchKriteria = useKriteriaStore((s) => s.fetchKriteria);
  const deleteKriteria = useKriteriaStore((s) => s.deleteKriteria);

  useEffect(() => {
    fetchKriteria();
  }, [fetchKriteria]);

  const totalBobot = kriteriaList.reduce((sum, k) => sum + k.bobot, 0);
  const benefitCount = kriteriaList.filter((k) => k.tipe === "Benefit").length;
  const costCount = kriteriaList.filter((k) => k.tipe === "Cost").length;

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kriteria "${name}"?`)) {
      try {
        await deleteKriteria(id);
      } catch (err: any) {
        alert(err.message || "Gagal menghapus kriteria.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans w-full select-none">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <span>Dashboard</span><span>/</span><span className="text-[#3b82f6]">Kriteria</span>
          </nav>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">Manajemen Kriteria SPK</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Kelola kriteria penilaian untuk Sistem Pendukung Keputusan.</p>
        </div>
        <button 
          onClick={() => navigate("/dashboard/kriteria/create")}
          className="bg-[#2563eb] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-blue-600 active:scale-95 transition cursor-pointer border-none"
        >
          <Plus size={14} /> Tambah Kriteria
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><ClipboardList size={20} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Kriteria</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{kriteriaList.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className={`p-3 rounded-xl ${totalBobot === 100 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
            {totalBobot === 100 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Bobot</span>
            <h3 className={`text-2xl font-extrabold ${totalBobot === 100 ? 'text-green-600' : 'text-amber-600'}`}>{totalBobot}%</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-black">B</div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipe Benefit</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{benefitCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-black">C</div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipe Cost</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{costCount}</h3>
          </div>
        </div>
      </div>

      {/* WARNING BANNER */}
      {totalBobot !== 100 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-600 shrink-0" />
          <p className="text-xs font-bold text-amber-700">
            Total bobot saat ini <span className="text-amber-900">{totalBobot}%</span> — harus tepat 100%. Silakan sesuaikan bobot kriteria.
          </p>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xs font-extrabold text-slate-700">Daftar Kriteria</h3>
          <span className="text-[10px] font-bold text-slate-400">{kriteriaList.length} kriteria</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50/75 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Kriteria</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Bobot</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4 w-24 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {loading && (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400 font-bold text-sm">
                  <Loader2 size={18} className="animate-spin inline-block mr-2" /> Memuat data...
                </td></tr>
              )}
              {!loading && kriteriaList.length === 0 && (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400 font-bold text-sm">Belum ada data kriteria.</td></tr>
              )}
              {!loading && kriteriaList.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-800">{k.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${k.tipe === 'Benefit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {k.tipe}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${k.bobot}%` }}></div>
                      </div>
                      <span className="font-bold text-slate-800">{k.bobot}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{k.keterangan}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/dashboard/kriteria/edit/${k.id}`)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer bg-transparent border-none" title="Edit">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(k.id, k.name)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition cursor-pointer bg-transparent border-none" title="Delete">
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
