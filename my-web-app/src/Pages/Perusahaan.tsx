import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  ChevronRight,
  Briefcase,
  Loader2,
  AlertCircle,
  Building2,
  Users,
} from "lucide-react";

import { api } from "../lib/api";
import { useAuthStore } from "../Store/AuthStore";

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

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-indigo-100 text-indigo-600",
  "bg-cyan-100 text-cyan-600",
];

const colorForId = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % avatarColors.length;
  return avatarColors[hash];
};

export const Perusahaan: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [bidangList, setBidangList] = useState<BidangItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBidangId, setSelectedBidangId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [companiesRes, bidangRes] = await Promise.all([
          api.getCompanies(),
          api.getBidang(),
        ]);
        if (cancelled) return;
        setCompanies(companiesRes.data as CompanyItem[]);
        setBidangList(bidangRes.data as BidangItem[]);
      } catch (err: any) {
        if (!cancelled) setErrorMsg(err?.message || "Gagal memuat daftar perusahaan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesField = !selectedBidangId || company.bidang?.id === selectedBidangId;
    return matchesSearch && matchesField;
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-4 px-6 text-center">
        <AlertCircle className="text-blue-500" size={40} />
        <h2 className="text-lg font-bold text-slate-800">Kamu belum login</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          Login dulu untuk melihat daftar perusahaan mitra kampusmu.
        </p>
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

  return (
    <div className="w-full flex flex-col font-sans text-slate-700 bg-white">
      {/* HEADER HERO SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 mt-4">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
            Eksplorasi Mitra Industri
          </h1>
          <p className="text-slate-500 text-xs lg:text-sm font-normal mt-2 leading-relaxed max-w-3xl">
            Temukan peluang magang dari jaringan perusahaan mitra kampusmu.
          </p>
        </div>

        <div className="w-full lg:w-80 shrink-0 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama perusahaan..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700 shadow-xs"
          />
        </div>
      </div>

      {/* FILTER BADGES */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-thin select-none">
        <button
          onClick={() => setSelectedBidangId("")}
          className={`flex items-center px-4 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedBidangId === ""
              ? "bg-[#0252c7] text-white shadow-sm"
              : "bg-blue-50/70 text-blue-600 border border-transparent hover:bg-blue-100"
          }`}
        >
          <span>Semua Bidang</span>
        </button>
        {bidangList.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBidangId(b.id)}
            className={`flex items-center px-4 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedBidangId === b.id
                ? "bg-[#0252c7] text-white shadow-sm"
                : "bg-blue-50/70 text-blue-600 border border-transparent hover:bg-blue-100"
            }`}
          >
            <Briefcase size={12} className="mr-1.5" />
            <span>{b.name}</span>
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl p-3 mb-6">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CARDS GRID */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-slate-400 text-sm">
          <Loader2 size={18} className="animate-spin" /> Memuat daftar perusahaan...
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => {
            const showImg = company.logo && /^https?:\/\//.test(company.logo);
            return (
              <div
                key={company.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* IMAGE / AVATAR CONTAINER */}
                <div className="relative h-36 w-full overflow-hidden bg-slate-50 flex items-center justify-center">
                  {showImg ? (
                    <img
                      src={company.logo as string}
                      alt={company.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg ${colorForId(
                        company.id
                      )}`}
                    >
                      {initials(company.name) || <Building2 size={22} />}
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
                    <span className="bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs select-none">
                      {company.work_mode}
                    </span>
                    {company.bidang?.name && (
                      <span className="bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs select-none">
                        {company.bidang.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* CARD DETAILS */}
                <div className="p-5 flex flex-col grow">
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight hover:text-[#0252c7] transition duration-200">
                    {company.name}
                  </h3>

                  {company.description && (
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                      {company.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                    <Users size={13} />
                    <span>{company.kuota} kuota tersedia</span>
                  </div>

                  <div className="border-t border-slate-100 my-4"></div>

                  <div className="flex justify-between items-center text-xs mt-auto font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-400 select-none">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{company.city}</span>
                    </div>
                    <Link
                      to={`/perusahaan/${company.id}`}
                      className="text-[#0252c7] hover:text-blue-700 transition flex items-center gap-0.5 text-xs font-bold"
                    >
                      <span>Lihat Detail</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-slate-400 text-sm font-semibold">
            Tidak ada perusahaan yang cocok dengan pencarian Anda.
          </p>
        </div>
      )}
    </div>
  );
};

export default Perusahaan;
