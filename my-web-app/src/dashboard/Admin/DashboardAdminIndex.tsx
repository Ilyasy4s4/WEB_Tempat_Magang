import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBidangStore } from "../../Store/BidangStore";
import { useKriteriaStore } from "../../Store/KriteriaStore";
import { usePerusahaanAdminStore } from "../../Store/PerusahaanAdminStore";
import {
  Layers,
  ClipboardList,
  Building2,
  Sliders,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function DashboardAdminIndex() {
  const navigate = useNavigate();

  const bidangList = useBidangStore((s) => s.bidangList);
  const fetchBidang = useBidangStore((s) => s.fetchBidang);
  const bidangLoading = useBidangStore((s) => s.loading);

  const kriteriaList = useKriteriaStore((s) => s.kriteriaList);
  const fetchKriteria = useKriteriaStore((s) => s.fetchKriteria);
  const kriteriaLoading = useKriteriaStore((s) => s.loading);

  const perusahaanList = usePerusahaanAdminStore((s) => s.perusahaanList);
  const fetchPerusahaan = usePerusahaanAdminStore((s) => s.fetchPerusahaan);
  const perusahaanLoading = usePerusahaanAdminStore((s) => s.loading);

  useEffect(() => {
    fetchBidang();
    fetchKriteria();
    fetchPerusahaan();
  }, [fetchBidang, fetchKriteria, fetchPerusahaan]);

  const loading = bidangLoading || kriteriaLoading || perusahaanLoading;

  const totalBobot = kriteriaList.reduce((sum, k) => sum + k.bobot, 0);
  const activePerusahaan = perusahaanList.filter((p) => p.status === "Aktif").length;

  const quickLinks = [
    { label: "Kelola Bidang", icon: Layers, path: "/dashboard/bidang", count: bidangList.length, color: "bg-blue-50 text-blue-600 border-blue-100" },
    { label: "Kelola Kriteria", icon: ClipboardList, path: "/dashboard/kriteria", count: kriteriaList.length, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { label: "Kelola Perusahaan", icon: Building2, path: "/dashboard/manajemen-perusahaan", count: perusahaanList.length, color: "bg-purple-50 text-purple-600 border-purple-100" },
    { label: "Sistem Pendukung Keputusan", icon: Sliders, path: "/dashboard/spk", count: perusahaanList.length, color: "bg-amber-50 text-amber-600 border-amber-100" },
  ];

  return (
    <div className="flex flex-col gap-8 font-sans w-full select-none">

      {/* HEADER */}
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
          Dashboard Admin
        </h2>
        <p className="text-xs lg:text-sm text-slate-400 font-medium mt-1">
          Selamat datang kembali! Berikut ringkasan data terkini.
        </p>
      </div>

      {loading && bidangList.length === 0 && kriteriaList.length === 0 && perusahaanList.length === 0 && (
        <div className="flex items-center justify-center py-16 text-slate-400 font-bold text-sm gap-2">
          <Loader2 size={18} className="animate-spin" /> Memuat data dashboard...
        </div>
      )}

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Bidang */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col hover:shadow-md transition duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Layers size={20} /></div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp size={10} /> Active
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Bidang</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{bidangList.length}</h3>
        </div>

        {/* Total Kriteria */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col hover:shadow-md transition duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><ClipboardList size={20} /></div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${totalBobot === 100 ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>
              {totalBobot === 100 ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
              {totalBobot}%
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Kriteria</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{kriteriaList.length}</h3>
        </div>

        {/* Total Perusahaan */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col hover:shadow-md transition duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-50 text-purple-600 p-3 rounded-xl"><Building2 size={20} /></div>
            <span className="text-[10px] font-bold text-slate-400">
              {activePerusahaan} Aktif
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Perusahaan</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{perusahaanList.length}</h3>
        </div>

        {/* Rata-rata Kuota */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col hover:shadow-md transition duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-xl"><Sliders size={20} /></div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Kuota Magang</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
            {perusahaanList.reduce((sum, p) => sum + p.kuota, 0)}
          </h3>
        </div>

      </div>

      {/* QUICK ACCESS CARDS */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-700 mb-4">Akses Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition duration-300 cursor-pointer text-left group`}
            >
              <div className={`p-3 rounded-xl ${link.color}`}>
                <link.icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">{link.label}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{link.count} data</p>
              </div>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition" />
            </button>
          ))}
        </div>
      </div>

      {/* RECENT DATA TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Perusahaan */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h4 className="text-xs font-extrabold text-slate-700">Perusahaan Terbaru</h4>
            <button onClick={() => navigate("/dashboard/manajemen-perusahaan")} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer bg-transparent border-none">
              Lihat Semua →
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {perusahaanList.length === 0 && !perusahaanLoading && (
              <div className="px-5 py-8 text-center text-[11px] text-slate-400 font-bold">Belum ada data perusahaan.</div>
            )}
            {perusahaanList.slice(0, 4).map((p) => (
              <div key={p.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${p.iconBg}`}>
                  {p.iconLetter}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{p.bidang}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'Aktif' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Kriteria */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h4 className="text-xs font-extrabold text-slate-700">Kriteria SPK</h4>
            <button onClick={() => navigate("/dashboard/kriteria")} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer bg-transparent border-none">
              Lihat Semua →
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {kriteriaList.length === 0 && !kriteriaLoading && (
              <div className="px-5 py-8 text-center text-[11px] text-slate-400 font-bold">Belum ada data kriteria.</div>
            )}
            {kriteriaList.slice(0, 5).map((k) => (
              <div key={k.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700">{k.name}</p>
                  <p className="text-[10px] text-slate-400">{k.tipe}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${k.bobot}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 w-8 text-right">{k.bobot}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
