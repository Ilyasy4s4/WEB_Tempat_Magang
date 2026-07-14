import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  ChevronLeft,
  Users,
  Star,
  MessageSquare,
  Loader2,
  AlertCircle,
  Building2,
  Briefcase,
  Landmark,
  Filter,
} from "lucide-react";

import { api } from "../lib/api";
import { useAuthStore } from "../Store/AuthStore";

interface CompanyDetail {
  id: string;
  name: string;
  city: string;
  address: string | null;
  work_mode: "WFO" | "WFH" | "Hybrid";
  kuota: number;
  description: string | null;
  logo: string | null;
  bidang?: { id: string; name: string };
  tenants?: { id: string; name: string };
}

interface CriteriaItem {
  id: string;
  name: string;
  source: "rating_mahasiswa" | "input_admin";
}

interface ReviewItem {
  id: string;
  userName: string;
  comment: string | null;
  createdAt: string;
  averageRating: number;
  ratings: { criteriaId: string; criteriaName: string; rating: number }[];
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

// Banner & avatar tidak punya foto asli di database, jadi kita pakai gradasi
// warna yang konsisten (deterministik berdasar id) sebagai pengganti visual
// yang rapi -- bukan data palsu, murni styling.
const gradients = [
  "from-blue-600 via-blue-500 to-indigo-600",
  "from-emerald-600 via-emerald-500 to-teal-600",
  "from-violet-600 via-purple-500 to-fuchsia-600",
  "from-amber-600 via-orange-500 to-rose-500",
  "from-cyan-600 via-sky-500 to-blue-600",
  "from-rose-600 via-pink-500 to-fuchsia-600",
];

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-indigo-100 text-indigo-600",
  "bg-cyan-100 text-cyan-600",
];

const colorForId = (id: string, palette: string[]) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % palette.length;
  return palette[hash];
};

const StarRow: React.FC<{ value: number; size?: number }> = ({ value, size = 13 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
      />
    ))}
  </div>
);

const REVIEWS_PAGE_SIZE = 5;

export const DetailPerusahaan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [criteriaList, setCriteriaList] = useState<CriteriaItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"terbaru" | "tertinggi" | "terendah">("terbaru");
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PAGE_SIZE);

  // Form ulasan
  const [newRatings, setNewRatings] = useState<Record<string, number>>({});
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isMahasiswa = user?.role === "mahasiswa";

  const loadData = useCallback(async () => {
    if (!id || !isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const [companyRes, criteriaRes, reviewsRes] = await Promise.all([
        api.getCompanyById(id),
        api.getCriteria(),
        api.getCompanyReviews(id),
      ]);

      setCompany(companyRes.data as CompanyDetail);
      const ratingCriteria = (criteriaRes.data as CriteriaItem[]).filter(
        (c) => c.source === "rating_mahasiswa"
      );
      setCriteriaList(ratingCriteria);
      setReviews(reviewsRes.data);
      setAverageRating(reviewsRes.averageRating);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat detail perusahaan.");
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, [loadData]);

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitError(null);
    setSubmitSuccess(false);

    const ratingsPayload = criteriaList.map((c) => ({
      criteriaId: c.id,
      rating: newRatings[c.id] ?? 0,
    }));

    if (ratingsPayload.some((r) => r.rating < 1 || r.rating > 5)) {
      setSubmitError("Harap beri rating 1-5 untuk setiap kriteria.");
      return;
    }
    if (!newComment.trim()) {
      setSubmitError("Harap isi pengalamanmu.");
      return;
    }

    setSubmitting(true);
    try {
      await api.createReview({ companyId: id, comment: newComment.trim(), ratings: ratingsPayload });
      setSubmitSuccess(true);
      setNewComment("");
      setNewRatings({});
      // refresh daftar ulasan
      const reviewsRes = await api.getCompanyReviews(id);
      setReviews(reviewsRes.data);
      setAverageRating(reviewsRes.averageRating);
      setVisibleCount(REVIEWS_PAGE_SIZE);
    } catch (err: any) {
      setSubmitError(err?.message || "Gagal mengirim ulasan.");
    } finally {
      setSubmitting(false);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOrder === "tertinggi") return b.averageRating - a.averageRating;
    if (sortOrder === "terendah") return a.averageRating - b.averageRating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const visibleReviews = sortedReviews.slice(0, visibleCount);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-4 px-6 text-center">
        <AlertCircle className="text-blue-500" size={40} />
        <h2 className="text-lg font-bold text-slate-800">Kamu belum login</h2>
        <p className="text-sm text-slate-500 max-w-sm">Login dulu untuk melihat detail perusahaan.</p>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="bg-[#0252c7] hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition"
        >
          Login sekarang
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-400 text-sm">
        <Loader2 size={18} className="animate-spin" /> Memuat detail perusahaan...
      </div>
    );
  }

  if (errorMsg || !company) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center px-6">
        <AlertCircle className="text-red-400" size={32} />
        <p className="text-sm text-slate-500">{errorMsg || "Perusahaan tidak ditemukan."}</p>
        <button
          type="button"
          onClick={() => navigate("/perusahaan")}
          className="text-xs font-bold text-[#0252c7] hover:underline"
        >
          Kembali ke daftar perusahaan
        </button>
      </div>
    );
  }

  const showImg = company.logo && /^https?:\/\//.test(company.logo);
  const banner = colorForId(company.id, gradients);
  const avatarTint = colorForId(company.id, avatarColors);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 -mx-6 -my-8 px-6 py-8 font-sans text-slate-700">
      {/* HEADER */}
      <div className="max-w-5xl mx-auto flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 border border-slate-200 bg-white rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
          title="Kembali"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-slate-500">Lihat Detail</span>
      </div>

      {/* HERO CARD */}
      <div className="max-w-5xl mx-auto bg-white border border-slate-100 rounded-3xl shadow-xs mb-8 overflow-hidden">
        {/* Banner dekoratif (gradasi + pola titik), tidak merepresentasikan foto asli */}
        <div className={`relative h-32 sm:h-44 bg-linear-to-br ${banner} overflow-hidden`}>
          <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`dots-${company.id}`} x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.6" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#dots-${company.id})`} />
          </svg>
        </div>

        <div className="px-6 sm:px-8 pb-7 -mt-12 sm:-mt-14 relative flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center shrink-0 overflow-hidden">
            {showImg ? (
              <img src={company.logo as string} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center font-black text-xl ${avatarTint}`}>
                {initials(company.name) || <Building2 size={26} />}
              </div>
            )}
          </div>

          <div className="flex-1 pt-1 sm:pt-14">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">{company.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {company.work_mode}
              </span>
              {company.bidang?.name && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                  {company.bidang.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" />
                <span>{company.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-slate-400" />
                <span>{company.kuota} kuota tersedia</span>
              </div>
              {reviews.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRow value={averageRating} />
                  <span className="font-bold text-slate-600">{averageRating.toFixed(1)}</span>
                  <span>({reviews.length} ulasan)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TENTANG PERUSAHAAN + INFORMASI CEPAT */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xs p-6 sm:p-8 h-full">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Tentang Perusahaan</h3>
            {company.description ? (
              <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                {company.description}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">Belum ada deskripsi untuk perusahaan ini.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xs p-6 sticky top-24">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Informasi Cepat</h3>

            <div className="flex flex-col gap-4">
              {company.bidang?.name && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Briefcase size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">Bidang</p>
                    <p className="text-xs font-bold text-slate-700">{company.bidang.name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Mode Kerja</p>
                  <p className="text-xs font-bold text-slate-700">{company.work_mode}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Kuota Magang</p>
                  <p className="text-xs font-bold text-slate-700">{company.kuota} orang</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPin size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Lokasi</p>
                  <p className="text-xs font-bold text-slate-700">
                    {company.address ? `${company.address}, ` : ""}{company.city}
                  </p>
                </div>
              </div>

              {company.tenants?.name && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Landmark size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">Kampus Mitra</p>
                    <p className="text-xs font-bold text-slate-700">{company.tenants.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ULASAN & RATING */}
      <div className="max-w-5xl mx-auto">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Ulasan & Rating</h3>

        {/* FORM ULASAN - hanya untuk mahasiswa */}
        {isMahasiswa && (
          <div className="bg-blue-50/40 border border-blue-100 rounded-3xl p-6 mb-6">
            <h4 className="text-sm font-bold text-slate-800 mb-1">Beri ulasan untuk perusahaan ini</h4>
            <p className="text-xs text-slate-500 mb-5">
              Bagaimana pengalamanmu bekerja atau berinteraksi dengan {company.name}?
            </p>

            {criteriaList.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada kriteria penilaian untuk kampusmu.</p>
            ) : (
              <form onSubmit={handleSendReview} className="flex flex-col gap-4">
                {criteriaList.map((c) => (
                  <div key={c.id} className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-700">{c.name}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRatings((prev) => ({ ...prev, [c.id]: star }))}
                          className="cursor-pointer bg-transparent border-none p-0"
                        >
                          <Star
                            size={20}
                            className={
                              star <= (newRatings[c.id] ?? 0)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-200 text-slate-200"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-700">Bagikan pendapatmu</span>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    placeholder="Ceritakan pengalaman magangmu di sini..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-blue-400 resize-none"
                  />
                </div>

                {submitError && (
                  <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}
                {submitSuccess && (
                  <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                    Ulasan berhasil dikirim, terima kasih!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="self-end bg-[#0252c7] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                  Kirim Ulasan
                </button>
              </form>
            )}
          </div>
        )}

        {/* FILTER */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Filter size={13} />
            <span>Filter berdasarkan:</span>
          </div>
          <div className="flex items-center gap-2">
            {([
              { key: "terbaru", label: "Terbaru" },
              { key: "tertinggi", label: "Rating Tertinggi" },
              { key: "terendah", label: "Rating Terendah" },
            ] as const).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSortOrder(opt.key)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition cursor-pointer ${
                  sortOrder === opt.key
                    ? "bg-blue-50 text-[#0252c7] border-blue-200"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* DAFTAR ULASAN */}
        {sortedReviews.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-xs text-slate-400">
            Belum ada ulasan untuk perusahaan ini.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {visibleReviews.map((r) => (
                <div key={r.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center ${colorForId(r.id, avatarColors)}`}>
                        {initials(r.userName)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{r.userName}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <StarRow value={r.averageRating} />
                  </div>

                  {r.comment && <p className="text-xs text-slate-500 leading-relaxed mt-2">{r.comment}</p>}

                  {r.ratings.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {r.ratings.map((rt) => (
                        <span
                          key={rt.criteriaId}
                          className="text-[10px] font-semibold bg-slate-50 border border-slate-100 text-slate-500 px-2 py-1 rounded-lg"
                        >
                          {rt.criteriaName}: {rt.rating}/5
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {visibleCount < sortedReviews.length && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + REVIEWS_PAGE_SIZE)}
                  className="text-xs font-bold text-[#0252c7] border border-blue-200 bg-white hover:bg-blue-50 rounded-xl px-6 py-2.5 transition cursor-pointer"
                >
                  Muat Lebih Banyak
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DetailPerusahaan;
