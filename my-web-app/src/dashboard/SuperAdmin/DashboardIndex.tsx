import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Star,
  MessageSquare,
  Users,
  RefreshCw,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { api } from "../../lib/api";
import { useAuthStore } from "../../Store/AuthStore";

interface CompanyItem {
  id: string;
  name: string;
  city: string;
  bidang_id: string;
  bidang?: { id: string; name: string };
  created_at: string;
}

interface BidangItem {
  id: string;
  name: string;
}

interface MahasiswaItem {
  id: string;
}

interface RecentReview {
  id: string;
  userName: string;
  comment: string | null;
  createdAt: string;
  averageRating: number;
  companyName: string;
}

// Warna avatar dipakai berulang di beberapa tempat, konsisten sama store lain
const bgColors = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-purple-50 text-purple-600",
  "bg-amber-50 text-amber-600",
  "bg-rose-50 text-rose-600",
  "bg-indigo-50 text-indigo-600",
];

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % bgColors.length;
  return bgColors[hash];
}

function initials(name: string) {
  return name.trim().split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase() || "?";
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit yang lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari yang lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID");
}

export default function DashboardIndex() {
  const navigate = useNavigate();
  const userName = useAuthStore((s) => s.user?.name) || "Admin";

  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [bidangList, setBidangList] = useState<BidangItem[]>([]);
  const [mahasiswaCount, setMahasiswaCount] = useState(0);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [totalUlasan, setTotalUlasan] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [companiesRes, bidangRes, mahasiswaRes] = await Promise.all([
        api.getCompanies(),
        api.getBidang(),
        api.getMahasiswaList(),
      ]);

      const companyList = (companiesRes.data || []) as CompanyItem[];
      setCompanies(companyList);
      setBidangList((bidangRes.data || []) as BidangItem[]);
      setMahasiswaCount(((mahasiswaRes.data || []) as MahasiswaItem[]).length);

      // Belum ada endpoint agregat "semua ulasan" di backend, jadi kita
      // kumpulkan dari endpoint per-perusahaan yang sudah ada.
      // Untuk skala kecil (jumlah company di satu portal) ini masih aman;
      // kalau datanya sudah besar, sebaiknya dibuat endpoint /reviews/summary di backend.
      const reviewResults = await Promise.all(
        companyList.map((c) =>
          api.getCompanyReviews(c.id).catch(() => null)
        )
      );

      let sumRating = 0;
      let countAll = 0;
      const allReviews: RecentReview[] = [];

      reviewResults.forEach((res, idx) => {
        if (!res) return;
        countAll += res.count;
        sumRating += res.averageRating * res.count;
        res.data.forEach((r) => {
          allReviews.push({
            id: r.id,
            userName: r.userName,
            comment: r.comment,
            createdAt: r.createdAt,
            averageRating: r.averageRating,
            companyName: companyList[idx].name,
          });
        });
      });

      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setTotalUlasan(countAll);
      setAvgRating(countAll > 0 ? sumRating / countAll : 0);
      setRecentReviews(allReviews.slice(0, 4));
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data ringkasan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const companiesByBidang = useMemo(() => {
    return bidangList
      .map((b) => ({
        name: b.name,
        count: companies.filter((c) => c.bidang_id === b.id || c.bidang?.id === b.id).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [bidangList, companies]);

  const maxBidangCount = Math.max(1, ...companiesByBidang.map((b) => b.count));

  const recentCompanies = useMemo(() => companies.slice(0, 5), [companies]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="animate-spin mr-2" size={20} />
        <span className="text-sm font-semibold">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-sans w-full text-slate-700 select-none">

      {/* 1. WELCOME HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Ringkasan Statistik
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Selamat datang kembali, {userName}. Berikut adalah aktivitas portal saat ini.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none"
          >
            <RefreshCw size={13} className="text-slate-400" />
            <span>Muat Ulang</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
          <AlertCircle size={14} />
          {errorMsg}
        </div>
      )}

      {/* 2. STATS 4-CARD BENTO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Perusahaan Mitra */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center hover:shadow-md transition duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perusahaan Mitra</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1.5">{companies.length}</h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl">
            <Building2 size={20} className="fill-blue-100" />
          </div>
        </div>

        {/* Total Mahasiswa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center hover:shadow-md transition duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Mahasiswa</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1.5">{mahasiswaCount}</h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl">
            <Users size={20} className="fill-blue-100" />
          </div>
        </div>

        {/* Rata-rata Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center hover:shadow-md transition duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rata-rata Rating</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1.5">{avgRating.toFixed(1)}</h3>
            <div className="flex items-center gap-0.5 mt-2.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                />
              ))}
            </div>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl">
            <Star size={20} className="fill-blue-100" />
          </div>
        </div>

        {/* Total Ulasan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center hover:shadow-md transition duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ulasan</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1.5">{totalUlasan}</h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl">
            <MessageSquare size={20} className="fill-blue-100" />
          </div>
        </div>

      </div>

      {/* 3. DUAL GRID (DISTRIBUSI BIDANG & ULASAN TERBARU) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Grid: Distribusi Perusahaan per Bidang (8 Columns) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800">Distribusi Perusahaan per Bidang</h3>
            <p className="text-[11px] text-slate-400">Jumlah perusahaan mitra pada tiap bidang</p>
          </div>

          {companiesByBidang.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-semibold py-10">
              Belum ada data bidang / perusahaan.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {companiesByBidang.map((b) => (
                <div key={b.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600 w-32 truncate">{b.name}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0252c7] rounded-full transition-all"
                      style={{ width: `${(b.count / maxBidangCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-800 w-6 text-right">{b.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Grid: Ulasan Terbaru (4 Columns) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center w-full mb-4">
              <h3 className="text-sm font-bold text-slate-800">Ulasan Terbaru</h3>
            </div>

            <div className="flex flex-col gap-4">
              {recentReviews.length > 0 ? (
                recentReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="border border-slate-100 rounded-2xl p-4 flex flex-col gap-2.5 bg-slate-50/30"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">
                          {initials(rev.userName)}
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-xs font-bold text-slate-700">{rev.userName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{rev.companyName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={i < Math.round(rev.averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.comment && (
                      <p className="text-[11px] text-slate-500 italic leading-relaxed line-clamp-2">
                        "{rev.comment}"
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 font-semibold">{timeAgo(rev.createdAt)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-slate-400 font-bold">
                  Belum ada ulasan masuk.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard/ulasan")}
            className="w-full mt-6 bg-transparent text-[#0252c7] hover:underline text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer select-none border-none py-1.5"
          >
            <span>Lihat Semua Ulasan</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>

      {/* 4. RECENT COMPANIES TABLE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-6">
        <div className="flex justify-between items-center w-full">
          <h3 className="text-sm font-bold text-slate-800">Perusahaan Terbaru Terdaftar</h3>
          <button
            onClick={() => navigate("/dashboard/manajemen-perusahaan")}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer select-none border-none bg-transparent"
          >
            Lihat Semua
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="pb-3.5 pl-2 font-black">Perusahaan</th>
                <th className="pb-3.5 font-black">Bidang</th>
                <th className="pb-3.5 font-black">Kota</th>
                <th className="pb-3.5 pr-2 text-right font-black">Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {recentCompanies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-400 font-semibold">
                    Belum ada perusahaan terdaftar.
                  </td>
                </tr>
              ) : (
                recentCompanies.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 last:border-none text-xs hover:bg-slate-50/50 transition">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${colorFor(c.id)}`}>
                          {initials(c.name)}
                        </div>
                        <span className="font-extrabold text-slate-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-slate-600">{c.bidang?.name || "-"}</td>
                    <td className="py-4 font-bold text-slate-600">{c.city}</td>
                    <td className="py-4 pr-2 text-right text-slate-400 font-semibold">{timeAgo(c.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}