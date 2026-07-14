import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sliders,
  RefreshCw,
  Award,
  Percent,
  CheckCircle2,
  HelpCircle,
  Loader2,
  AlertCircle,
  MapPin,
  Briefcase,
  ClipboardList,
} from "lucide-react";

import { api } from "../../lib/api";

// =========================================================
// Tipe data dari backend (sama seperti Pages/Rekomendasi.tsx,
// tapi dipakai di sisi Admin untuk simulasi ranking perusahaan
// mitra kampusnya sendiri).
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
  is_active?: boolean;
  bidang?: { id: string; name: string };
}

interface ResultItem {
  rank: number;
  companyId: string;
  companyName: string;
  score: number;
}

const workModes: { value: "" | "WFO" | "WFH" | "Hybrid"; label: string }[] = [
  { value: "", label: "Semua Mode" },
  { value: "WFO", label: "WFO" },
  { value: "WFH", label: "WFH / Remote" },
  { value: "Hybrid", label: "Hybrid" },
];

export default function SistemPendukungKeputusan() {
  const navigate = useNavigate();

  // Data referensi dari backend (kriteria & perusahaan milik tenant admin)
  const [criteriaList, setCriteriaList] = useState<CriteriaItem[]>([]);
  const [bidangList, setBidangList] = useState<BidangItem[]>([]);
  const [companiesMap, setCompaniesMap] = useState<Record<string, CompanyItem>>({});
  const [cities, setCities] = useState<string[]>([]);

  // Filter
  const [selectedBidangId, setSelectedBidangId] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedMode, setSelectedMode] = useState<"" | "WFO" | "WFH" | "Hybrid">("");

  // Bobot kriteria (dinamis sesuai kriteria kampus ini)
  const [weights, setWeights] = useState<Record<string, number>>({});

  // Hasil ranking
  const [results, setResults] = useState<ResultItem[]>([]);

  const [loadingRef, setLoadingRef] = useState(true);
  const [loadingResult, setLoadingResult] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // ===============================================
  // Ambil data referensi: kriteria, bidang, perusahaan
  // ===============================================
  useEffect(() => {
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

        const initialWeights: Record<string, number> = {};
        criteria.forEach((c) => {
          initialWeights[c.id] = Math.round(Number(c.default_weight)) || 0;
        });
        setWeights(initialWeights);

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
  }, []);

  // ===============================================
  // Hitung ranking: pakai endpoint rekomendasi (SAW) yang sama
  // dengan yang dipakai mahasiswa — admin & mahasiswa sama-sama
  // authenticated user, jadi request ini "milik" admin sendiri,
  // dipakai murni untuk simulasi/preview.
  // ===============================================
  const handleHitungRanking = useCallback(async () => {
    if (criteriaList.length === 0) {
      setErrorMsg("Belum ada kriteria yang terdaftar untuk kampusmu.");
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
      setErrorMsg(err?.message || "Gagal menghitung ranking dari server.");
    } finally {
      setLoadingResult(false);
    }
  }, [criteriaList, weights, selectedBidangId, selectedCity, selectedMode]);

  // Jalankan otomatis sekali setelah data referensi siap
  useEffect(() => {
    if (!loadingRef && criteriaList.length > 0 && !hasSearched) {
      handleHitungRanking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingRef, criteriaList.length]);

  const totalWeight = criteriaList.reduce((sum, c) => sum + (weights[c.id] ?? 0), 0);

  return (
    <div className="flex flex-col gap-8 font-sans w-full relative select-none">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-[#3b82f6]">SPK</span>
          </nav>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
            Sistem Pendukung Keputusan (SPK)
          </h2>
          <p className="text-xs lg:text-sm text-slate-400 font-medium mt-1 max-w-2xl">
            Simulasikan ranking perusahaan mitra kampusmu memakai metode SAW — bobot &amp; kriteria
            yang sama dengan yang dipakai mahasiswa di halaman Rekomendasi.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard/kriteria")}
            className="text-xs font-bold flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            <ClipboardList size={14} />
            <span>Kelola Kriteria</span>
          </button>
        </div>
      </div>

      {loadingRef ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400 shadow-xs flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin" /> Memuat data kriteria &amp; perusahaan...
        </div>
      ) : criteriaList.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400 shadow-xs">
          Belum ada kriteria yang terdaftar. Tambahkan kriteria dulu di menu{" "}
          <button
            type="button"
            onClick={() => navigate("/dashboard/kriteria")}
            className="text-blue-600 font-bold underline cursor-pointer bg-transparent border-none p-0"
          >
            Kelola Kriteria
          </button>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT PANEL: BOBOT KRITERIA + FILTER */}
          <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-50 text-[#3b82f6] p-2 rounded-xl">
                <Sliders size={18} />
              </div>
              <h3 className="text-sm lg:text-base font-extrabold text-slate-800">Bobot Kriteria</h3>
            </div>

            <div className="space-y-6">
              {criteriaList.map((c) => (
                <div key={c.id} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">
                      {c.name}{" "}
                      <span className="text-slate-300 font-normal">
                        ({c.type === "benefit" ? "benefit" : "cost"})
                      </span>
                    </span>
                    <span className="font-extrabold text-[#3b82f6]">{weights[c.id] ?? 0}%</span>
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

            {/* Total bobot indicator */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">Total Bobot:</span>
                <span className={`font-extrabold ${totalWeight === 100 ? "text-green-600" : "text-amber-500"}`}>
                  {totalWeight}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                * Bobot otomatis dinormalisasi oleh backend, jadi tidak wajib pas 100% — tapi
                disarankan mendekati 100% supaya proporsinya mudah dibaca.
              </p>
            </div>

            {/* Filter tambahan */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Filter Perusahaan
              </span>

              <select
                value={selectedBidangId}
                onChange={(e) => setSelectedBidangId(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500/50 cursor-pointer"
              >
                <option value="">Semua Bidang</option>
                {bidangList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500/50 cursor-pointer"
              >
                <option value="">Semua Kota</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value as "" | "WFO" | "WFH" | "Hybrid")}
                className="w-full bg-[#f8f9ff] border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500/50 cursor-pointer"
              >
                {workModes.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleHitungRanking}
              disabled={loadingResult}
              className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-[#3b82f6] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              {loadingResult ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Menghitung...
                </>
              ) : (
                <>
                  <RefreshCw size={12} />
                  <span>Hitung Ulang Ranking</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl p-3 mt-4">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: RANKING PERUSAHAAN */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 text-[#3b82f6] p-2 rounded-xl">
                  <Award size={18} />
                </div>
                <h3 className="text-sm lg:text-base font-extrabold text-slate-800">
                  Ranking Perusahaan
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">
                Metode SAW Aktif
              </span>
            </div>

            {loadingResult ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
                <Loader2 size={16} className="animate-spin" /> Menghitung ranking...
              </div>
            ) : results.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead className="bg-slate-50/75 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 w-16 text-center">Rank</th>
                      <th className="px-6 py-4">Perusahaan</th>
                      <th className="px-6 py-4">Lokasi</th>
                      <th className="px-6 py-4">Mode Kerja</th>
                      <th className="px-6 py-4 text-center">Match Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                    {results.map((item) => {
                      const company = companiesMap[item.companyId];
                      return (
                        <tr key={item.companyId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-[10px] ${
                                item.rank === 1
                                  ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                                  : item.rank === 2
                                  ? "bg-slate-100 text-slate-600"
                                  : item.rank === 3
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-50 text-slate-400"
                              }`}
                            >
                              {item.rank}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{item.companyName}</span>
                              {company?.bidang?.name && (
                                <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                  <Briefcase size={10} /> {company.bidang.name}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {company?.city && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <MapPin size={12} className="text-slate-400" /> {company.city}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {company?.work_mode && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                {company.work_mode}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-extrabold text-[#3b82f6]">
                              {Math.round(item.score * 100)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : hasSearched ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Tidak ada perusahaan yang cocok dengan filter yang dipilih.
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                Atur bobot kriteria lalu klik "Hitung Ulang Ranking".
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ALGORITHM EXPLAINER */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <HelpCircle size={14} className="text-[#3b82f6]" />
            Bagaimana skor ini dihitung?
          </h4>
          <p className="text-[11px] lg:text-xs text-slate-500 leading-relaxed font-medium">
            Modul ini memakai metode <strong>Simple Additive Weighting (SAW)</strong>: tiap nilai
            kriteria perusahaan dinormalisasi (benefit = nilai/max, cost = min/nilai), lalu
            dikalikan bobot dan dijumlahkan jadi satu skor akhir. Kriteria dengan sumber "rating
            mahasiswa" nilainya otomatis dari rata-rata ulasan, sementara kriteria "input admin"
            diisi manual lewat menu Kelola Perusahaan.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-start md:justify-end">
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-xs">
            <Percent size={16} className="text-[#3b82f6]" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Normalisasi</span>
              <span className="text-xs font-bold text-slate-800">Benefit &amp; Cost Criteria</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-xs">
            <CheckCircle2 size={16} className="text-green-500" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Status</span>
              <span className="text-xs font-bold text-slate-800">Data Real-time dari Server</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}