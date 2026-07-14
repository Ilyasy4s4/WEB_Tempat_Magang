import { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Star,
  Trash2,
  Loader2,
  Building2,
} from "lucide-react";
import { api } from "../../lib/api";

interface AdminReview {
  id: string;
  userName: string;
  companyId: string;
  companyName: string;
  comment: string | null;
  createdAt: string;
  averageRating: number;
  ratings: { criteriaId: string; criteriaName: string; rating: number }[];
}

const avatarColors = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-purple-50 text-purple-600",
  "bg-amber-50 text-amber-600",
  "bg-rose-50 text-rose-600",
  "bg-indigo-50 text-indigo-600",
];

function initials(name: string) {
  return name.trim().split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();
}

function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit yang lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari yang lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function Ulasan() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getReviews();
      setReviews(res.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data ulasan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ulasan ini secara permanen? Nilai rating kriteria terkait akan dihitung ulang.")) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || "Gagal menghapus ulasan.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = useMemo(() => {
    if (ratingFilter === "all") return reviews;
    const target = Number(ratingFilter);
    return reviews.filter((r) => Math.round(r.averageRating) === target);
  }, [reviews, ratingFilter]);

  const totalReviews = reviews.length;
  const overallAverage = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.averageRating, 0) / reviews.length;
  }, [reviews]);
  const totalCompaniesReviewed = useMemo(
    () => new Set(reviews.map((r) => r.companyId)).size,
    [reviews]
  );

  return (
    <div className="flex flex-col gap-8 font-sans w-full text-slate-700 select-none">

      {/* 1. HEADER SECTION */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Manajemen Ulasan & Rating
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Pantau ulasan dari mahasiswa dan hapus ulasan yang melanggar untuk menjaga kualitas data.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {/* 2. STATS CARDS - angka asli dari data yang dimuat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ulasan</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{totalReviews}</h3>
          </div>
          <div className="bg-blue-50 text-[#0252c7] p-3.5 rounded-2xl">
            <MessageSquare size={20} className="fill-blue-100" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating Rata-rata</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{overallAverage.toFixed(1)} / 5.0</h3>
            <div className="flex items-center gap-0.5 mt-2 select-none text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={i < Math.round(overallAverage) ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                />
              ))}
            </div>
          </div>
          <div className="bg-amber-50 text-amber-500 p-3.5 rounded-2xl">
            <Star size={20} className="fill-amber-100" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perusahaan Ternilai</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{totalCompaniesReviewed}</h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl">
            <Building2 size={20} />
          </div>
        </div>

      </div>

      {/* 3. TABLE FILTERING PANEL */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full border-b border-slate-100 pb-5">
          <h3 className="text-sm font-bold text-slate-800">Daftar Ulasan</h3>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-600 py-2 px-3 rounded-xl text-xs font-bold outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Semua Rating</option>
            <option value="5">5 Bintang</option>
            <option value="4">4 Bintang</option>
            <option value="3">3 Bintang</option>
            <option value="2">2 Bintang</option>
            <option value="1">1 Bintang</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="pb-3.5 pl-2 font-black">Pengguna & Perusahaan</th>
                <th className="pb-3.5 font-black">Konten Ulasan</th>
                <th className="pb-3.5 font-black">Rating</th>
                <th className="pb-3.5 pr-2 text-right font-black">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-slate-400 font-bold text-sm">
                    <Loader2 size={18} className="animate-spin inline-block mr-2" /> Memuat data...
                  </td>
                </tr>
              )}

              {!loading && filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-slate-400 font-bold text-sm">
                    Belum ada ulasan.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredReviews.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-none text-xs hover:bg-slate-50/50 transition">

                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${avatarColor(r.userName)}`}>
                          {initials(r.userName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-800 leading-none mb-1">{r.userName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold leading-none mb-1">{timeAgo(r.createdAt)}</span>
                          <span className="text-[10px] text-[#0252c7] font-extrabold leading-none">{r.companyName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 font-medium text-slate-500 italic max-w-xs truncate leading-relaxed">
                      {r.comment ? `"${r.comment}"` : <span className="text-slate-300 not-italic">Tidak ada komentar</span>}
                    </td>

                    <td className="py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-0.5 text-yellow-400 mb-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className={i < Math.round(r.averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{r.averageRating.toFixed(1)} / 5.0</span>
                      </div>
                    </td>

                    <td className="py-4 pr-2 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition cursor-pointer border-none bg-transparent text-slate-400 disabled:opacity-50"
                        title="Hapus Permanen"
                      >
                        {deletingId === r.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </td>

                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="border-t border-slate-100 pt-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Menampilkan {filteredReviews.length} dari {totalReviews} ulasan
            </span>
          </div>
        )}

      </div>

    </div>
  );
}