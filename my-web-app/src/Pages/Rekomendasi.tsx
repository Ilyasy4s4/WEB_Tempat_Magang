import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  Briefcase,
  Filter,
  Sliders,
  Loader2,
  AlertCircle,
  Users,
  Building2,
} from "lucide-react";

import filterBg from "../assets/filter-bg.png";
import { api } from "../lib/api";
import { useAuthStore } from "../Store/AuthStore";

// =========================================================
// Tipe data dari backend
// =========================================================
interface CriteriaItem {
  id: string;
  name: string;
  type: "benefit" | "cost";
  default_weight: number | string;
}

interface BidangItem {
  id: string;
  name: string;
}

interface CompanyItem {
  id: string;
  name: string;
  city: string;
  work_mode: "WFO" | "WFH" | "Hybrid";
  kuota: number;
  description: string | null;
  logo: string | null;
  bidang?: { id: string; name: string };
}

interface ResultItem {
  rank: number;
  companyId: string;
  companyName: string;
  score: number;
}

const workModes: { value: "" | "WFO" | "WFH" | "Hybrid"; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "WFO", label: "WFO" },
  { value: "WFH", label: "WFH / Remote" },
  { value: "Hybrid", label: "Hybrid" },
];

// Bagi 100% rata ke semua kriteria yang ada.
// Sisa pembulatan (kalau 100 tidak habis dibagi rata, misal 3 kriteria -> 33,33,33 sisa 1)
// ditambahkan ke kriteria-kriteria pertama, supaya totalnya selalu PAS 100.
function buildEqualWeights(criteria: { id: string }[]): Record<string, number> {
  const n = criteria.length;
  if (n === 0) return {};

  const base = Math.floor(100 / n);
  const remainder = 100 - base * n;

  const result: Record<string, number> = {};
  criteria.forEach((c, index) => {
    result[c.id] = base + (index < remainder ? 1 : 0);
  });
  return result;
}

// Avatar fallback (logo perusahaan) - inisial huruf + warna konsisten per-id,
// dipakai kalau perusahaan belum punya logo.
const avatarColors = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
  "bg-rose-50 text-rose-600",
  "bg-indigo-50 text-indigo-600",
  "bg-cyan-50 text-cyan-600",
];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % avatarColors.length;
  return avatarColors[hash];
}

export const Rekomendasi: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Data referensi dari backend
  const [criteriaList, setCriteriaList] = useState<CriteriaItem[]>([]);
  const [bidangList, setBidangList] = useState<BidangItem[]>([]);
  const [companiesMap, setCompaniesMap] = useState<Record<string, CompanyItem>>({});
  const [cities, setCities] = useState<string[]>([]);

  // Filter States
  const [selectedBidangId, setSelectedBidangId] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<"" | "WFO" | "WFH" | "Hybrid">("");

  // Dropdown UI States
  const [cityOpen, setCityOpen] = useState(false);
  const [bidangOpen, setBidangOpen] = useState(false);

  // Bobot kriteria (dinamis, sesuai kriteria milik kampus si mahasiswa)
  const [weights, setWeights] = useState<Record<string, number>>({});

  // Hasil rekomendasi
  const [results, setResults] = useState<ResultItem[]>([]);
  const [sortOrder, setSortOrder] = useState<"highest" | "lowest">("highest");

  const [loadingRef, setLoadingRef] = useState(true);
  const [loadingResult, setLoadingResult] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // ===============================================
  // Ambil data referensi: kriteria, bidang, perusahaan
  // ===============================================
  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingRef(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoadingRef(true);
      setErrorMsg(null);
      try {
        const [criteriaRes, bidangRes, companiesRes] = await Promise.all([
          api.getCriteria(),
          api.getBidang(),
          api.getCompanies(),
        ]);

        if (cancelled) return;

        const criteria = criteriaRes.data as CriteriaItem[];
        setCriteriaList(criteria);
        setWeights(buildEqualWeights(criteria));

        setBidangList(bidangRes.data as BidangItem[]);

        const companies = companiesRes.data as CompanyItem[];
        const map: Record<string, CompanyItem> = {};
        const cityList = new Set<string>();
        companies.forEach((c) => {
          map[c.id] = c;
          if (c.city) cityList.add(c.city);
        });
        setCompaniesMap(map);
        setCities(Array.from(cityList).sort());
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message || "Gagal memuat data referensi dari server.");
        }
      } finally {
        if (!cancelled) setLoadingRef(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // ===============================================
  // Panggil backend: buat request rekomendasi -> hitung SAW
  // ===============================================
  const handleCariRekomendasi = useCallback(async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (criteriaList.length === 0) {
      setErrorMsg("Belum ada kriteria yang terdaftar untuk kampusmu.");
      return;
    }

    const currentTotal = Object.values(weights).reduce((sum, w) => sum + (w || 0), 0);
    if (currentTotal !== 100) {
      setErrorMsg(`Total bobot harus tepat 100% (saat ini ${currentTotal}%).`);
      return;
    }

    setLoadingResult(true);
    setErrorMsg(null);
    setHasSearched(true);

    try {
      const weightPayload = criteriaList.map((c) => ({
        criteriaId: c.id,
        weight: weights[c.id] ?? 0,
      }));

      const createRes = await api.createRecommendationRequest({
        bidangId: selectedBidangId || undefined,
        city: selectedCity || undefined,
        work_mode: selectedMode || undefined,
        weights: weightPayload,
      });

      const requestId = createRes.data.id as string;

      const resultRes = await api.getRecommendationResult(requestId);
      setResults(resultRes.data as ResultItem[]);
    } catch (err: any) {
      setResults([]);
      setErrorMsg(err?.message || "Gagal mengambil rekomendasi dari server.");
    } finally {
      setLoadingResult(false);
    }
  }, [isAuthenticated, criteriaList, weights, selectedBidangId, selectedCity, selectedMode, navigate]);

  // Jalankan pencarian pertama kali otomatis setelah data referensi siap
  useEffect(() => {
    if (!loadingRef && isAuthenticated && criteriaList.length > 0 && !hasSearched) {
      handleCariRekomendasi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingRef, isAuthenticated, criteriaList.length]);

  const sortedResults = [...results].sort((a, b) =>
    sortOrder === "highest" ? b.score - a.score : a.score - b.score
  );

  // Total bobot semua kriteria saat ini - harus tepat 100% supaya tombol cari aktif
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + (w || 0), 0);

  // ===============================================
  // Belum login -> tidak bisa memanggil endpoint yang butuh token
  // ===============================================
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] bg-slate-50 gap-4 px-6 text-center">
        <AlertCircle className="text-blue-500" size={40} />
        <h2 className="text-lg font-bold text-slate-800">Kamu belum login</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          Fitur rekomendasi magang memakai data akun dan kampusmu, jadi kamu perlu login sebagai
          mahasiswa dulu untuk melihat hasilnya.
        </p>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="bg-[#3b82f6] hover:bg-blue-600 text-white font-bold text-xs py-3 px-6 rounded-xl transition"
        >
          Login sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen pb-20 select-none">
      {/* 1. FILTER SEARCH PANEL */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-6">
        <div className="relative rounded-3xl min-h-45 sm:min-h-37.5 flex items-center shadow-lg bg-slate-900">
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <img src={filterBg} alt="Filter Background" className="w-full h-full object-cover filter brightness-[0.7] contrast-105" />
            <div className="absolute inset-0 bg-[#0f172a]/60"></div>
          </div>

          <div className="relative z-10 w-full px-6 sm:px-10 flex flex-col gap-4 text-white py-4">
            <h3 className="text-sm font-bold tracking-wide flex items-center gap-2">
              <Filter size={16} className="text-blue-400" />
              Filter Pencarian
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              {/* KOTA Dropdown */}
              <div className="sm:col-span-4 flex flex-col gap-1 relative">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Kota</label>

                {cityOpen && <div className="fixed inset-0 z-20" onClick={() => setCityOpen(false)} />}

                <button
                  type="button"
                  onClick={() => setCityOpen(!cityOpen)}
                  className="w-full bg-white text-slate-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{selectedCity || "Semua Kota"}</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">▼</span>
                </button>

                {cityOpen && (
                  <div className="absolute top-[110%] left-0 right-0 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 z-30 max-h-52 overflow-y-auto py-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedCity(""); setCityOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer ${selectedCity === "" ? "bg-blue-50 text-blue-600 font-bold" : ""}`}
                    >
                      Semua Kota
                    </button>
                    {cities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => { setSelectedCity(city); setCityOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer ${selectedCity === city ? "bg-blue-50 text-blue-600 font-bold" : ""}`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* BIDANG Dropdown */}
              <div className="sm:col-span-4 flex flex-col gap-1 relative">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Bidang</label>

                {bidangOpen && <div className="fixed inset-0 z-20" onClick={() => setBidangOpen(false)} />}

                <button
                  type="button"
                  onClick={() => setBidangOpen(!bidangOpen)}
                  className="w-full bg-white text-slate-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-slate-400" />
                    <span>{bidangList.find((b) => b.id === selectedBidangId)?.name || "Semua Bidang"}</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">▼</span>
                </button>

                {bidangOpen && (
                  <div className="absolute top-[110%] left-0 right-0 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 z-30 max-h-52 overflow-y-auto py-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedBidangId(""); setBidangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer ${selectedBidangId === "" ? "bg-blue-50 text-blue-600 font-bold" : ""}`}
                    >
                      Semua Bidang
                    </button>
                    {bidangList.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => { setSelectedBidangId(b.id); setBidangOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer ${selectedBidangId === b.id ? "bg-blue-50 text-blue-600 font-bold" : ""}`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* MODE KERJA Pills */}
              <div className="sm:col-span-4 flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Mode Kerja</label>
                <div className="flex flex-wrap gap-2">
                  {workModes.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setSelectedMode(mode.value)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition select-none cursor-pointer active:scale-95
                        ${selectedMode === mode.value
                          ? "bg-[#3b82f6] text-white shadow-md shadow-blue-500/20"
                          : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"}`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DUAL COLUMN LAYOUT */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* LEFT COLUMN: Bobot Kriteria (SPK Sliders) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/50 flex flex-col gap-6 sticky top-24">
            <div>
              <h4 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <Sliders size={18} className="text-[#3b82f6]" />
                Bobot Kriteria
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Sesuaikan preferensi Anda untuk hasil yang lebih akurat.
              </p>
            </div>

            {loadingRef ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-6 justify-center">
                <Loader2 size={16} className="animate-spin" /> Memuat kriteria...
              </div>
            ) : criteriaList.length === 0 ? (
              <p className="text-xs text-slate-400">
                Belum ada kriteria yang terdaftar untuk kampusmu.
              </p>
            ) : (
              <>
                {/* Indikator total bobot - harus pas 100% supaya tombol cari aktif */}
                <div
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold border ${
                    totalWeight === 100
                      ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                      : "bg-red-50 border-red-100 text-red-500"
                  }`}
                >
                  <span>Total Bobot</span>
                  <div className="flex items-center gap-2">
                    <span>{totalWeight}% / 100%</span>
                    <button
                      type="button"
                      onClick={() => setWeights(buildEqualWeights(criteriaList))}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Ratakan
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {criteriaList.map((c) => (
                    <div key={c.id} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>
                          {c.name}{" "}
                          <span className="text-slate-300 font-normal">
                            ({c.type === "benefit" ? "benefit" : "cost"})
                          </span>
                        </span>
                        <span className="text-[#3b82f6]">{weights[c.id] ?? 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={weights[c.id] ?? 0}
                        onChange={(e) =>
                          setWeights((prev) => ({ ...prev, [c.id]: Number(e.target.value) }))
                        }
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={handleCariRekomendasi}
              disabled={loadingResult || loadingRef || criteriaList.length === 0 || totalWeight !== 100}
              className="w-full mt-4 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-[#1e3a8a] py-3.5 px-4 rounded-xl font-bold text-xs transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {loadingResult ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Menghitung...
                </>
              ) : totalWeight !== 100 ? (
                `Total Bobot Harus 100% (saat ini ${totalWeight}%)`
              ) : (
                "Cari Rekomendasi"
              )}
            </button>

            {errorMsg && (
              <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Rekomendasi Terkurasi */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex justify-between items-center w-full">
            <h4 className="text-base font-bold text-slate-800">Rekomendasi Terkurasi (Metode SAW)</h4>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Urutkan:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "highest" | "lowest")}
                className="bg-transparent text-blue-600 font-bold border-none outline-none cursor-pointer"
              >
                <option value="highest">Match Score Tertinggi</option>
                <option value="lowest">Match Score Terendah</option>
              </select>
            </div>
          </div>

          {loadingResult ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 shadow-sm flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" /> Menghitung rekomendasi terbaik untukmu...
            </div>
          ) : sortedResults.length > 0 ? (
            <div className="flex flex-col gap-5">
              {sortedResults.map((item) => {
                const company = companiesMap[item.companyId];
                const showImg = company?.logo && /^https?:\/\//.test(company.logo);
                return (
                  <div
                    key={item.companyId}
                    className="bg-white border border-slate-150 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-sm hover:shadow hover:border-slate-200 transition duration-300"
                  >
                    <div className="flex items-center gap-5">
                      {/* Logo perusahaan (fallback: inisial huruf) + badge ranking kecil di pojok */}
                      <div className="relative shrink-0">
                        <div className={`w-14 h-14 border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden font-extrabold text-lg ${company ? colorForId(company.id) : "bg-blue-50 text-blue-500"}`}>
                          {showImg ? (
                            <img src={company!.logo as string} alt={company!.name} className="w-full h-full object-cover" />
                          ) : company ? (
                            initials(company.name) || <Building2 size={20} />
                          ) : (
                            <Building2 size={20} />
                          )}
                        </div>
                        <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-[#3b82f6] text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm border-2 border-white">
                          {item.rank}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap gap-2 items-center">
                          <h3 className="text-base font-bold text-slate-800 leading-none">
                            {item.companyName}
                          </h3>
                          {company?.work_mode && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full select-none bg-blue-50 text-blue-600 border border-blue-100">
                              {company.work_mode}
                            </span>
                          )}
                          {company?.bidang?.name && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full select-none bg-indigo-50 text-indigo-600 border border-indigo-100">
                              {company.bidang.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          {company?.city && (
                            <>
                              <MapPin size={12} className="text-slate-400" />
                              <span>{company.city}, Indonesia</span>
                            </>
                          )}
                        </div>

                        {company?.description && (
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 max-w-lg mt-1">
                            {company.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1 text-xs text-slate-400">
                          {typeof company?.kuota === "number" && (
                            <div className="flex items-center gap-1">
                              <Users size={13} className="text-slate-400" />
                              <span>{company.kuota} kuota</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                      <div className="flex flex-col md:items-end">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                          Match Score
                        </span>
                        <span className="text-3xl font-extrabold text-[#3b82f6] leading-none mt-1">
                          {Math.round(item.score * 100)}%
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate("/perusahaan/" + item.companyId)}
                        className="bg-[#3b82f6] hover:bg-blue-600 text-white font-bold text-xs py-3 px-5 rounded-xl transition shadow shadow-blue-500/10 active:scale-[0.98] cursor-pointer"
                      >
                        View Detail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : hasSearched ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
              Tidak ada rekomendasi magang yang cocok dengan filter yang dipilih.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 shadow-sm flex items-center justify-center gap-2">
              <Star size={16} className="text-slate-300" /> Atur bobot kriteria lalu klik "Cari Rekomendasi".
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Rekomendasi;