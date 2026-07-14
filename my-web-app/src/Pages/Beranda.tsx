import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  ArrowRight, 
  ChevronRight,
  Building2,
  Compass,
  Sparkles,
  Star 
} from "lucide-react";

import heroBg from "../assets/hero-bg.png";
import whyUsBuilding from "../assets/why-us-building.png";
import telkomHub from "../assets/telkom-hub.png";
import gojekOffice from "../assets/Kantor-Gojek.jpg";
import blibliOffice from "../assets/blibli-office.png";

import { api } from "../lib/api";
import { useAuthStore } from "../Store/AuthStore";

interface PopularCompany {
  id: string;
  name: string;
  city: string;
  bidangName: string;
  averageRating: number;
  reviewCount: number;
  logo: string | null;
}

// Fallback statis dipakai untuk pengunjung yang BELUM login, karena
// GET /companies di backend butuh token (data perusahaan bersifat
// per-kampus/tenant). Begitu user login, section ini otomatis ganti
// ke data perusahaan asli dari database.
const FALLBACK_COMPANIES = [
  { image: telkomHub, name: "PT. Telkom Indonesia Tbk", tags: ["Backend", "Data Scientist"], rating: 5.0, city: "Jakarta Pusat" },
  { image: gojekOffice, name: "Gojek (Goto Group)", tags: ["Fullstack", "UI/UX"], rating: 4.9, city: "Jakarta Selatan" },
  { image: blibliOffice, name: "Blibli (Global Digital Niaga)", tags: ["Frontend", "DevOps"], rating: 4.7, city: "Jakarta Pusat" },
];

export default function Beranda() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [popularCompanies, setPopularCompanies] = useState<PopularCompany[] | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setPopularCompanies(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const companiesRes = await api.getCompanies();
        const companies = (companiesRes.data || []).slice(0, 3);

        const withRatings = await Promise.all(
          companies.map(async (c: any) => {
            const reviewRes = await api.getCompanyReviews(c.id).catch(() => null);
            return {
              id: c.id,
              name: c.name,
              city: c.city,
              bidangName: c.bidang?.name || "-",
              averageRating: reviewRes?.averageRating || 0,
              reviewCount: reviewRes?.count || 0,
              logo: c.logo || null,
            };
          })
        );

        if (!cancelled) setPopularCompanies(withRatings);
      } catch {
        if (!cancelled) setPopularCompanies(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col w-full bg-[#fdfdfd] select-none overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-125 flex items-center justify-start overflow-hidden">
        {/* Background Image */}
        <img 
          src={heroBg} 
          alt="Office Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-950/75 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/45 to-transparent pointer-events-none"></div>

        {/* Content Wrapper */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col text-white gap-4">
          <h1 className="text-4xl lg:text-5.5xl font-extrabold tracking-tight leading-tight max-w-2xl font-sans">
            Temukan Karir IT <br />
            <span className="text-[#3b82f6]">Impianmu</span>
          </h1>
          <p className="text-sm lg:text-base text-slate-300 max-w-xl leading-relaxed font-medium">
            Platform cerdas yang menggunakan algoritma pendukung keputusan untuk memetakan keahlianmu ke peluang magang yang paling relevan di industri teknologi.
          </p>
        </div>
      </section>

      {/* 2. STATISTICS BAR */}
      <section className="bg-white border-y border-slate-100 py-8 select-none">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200/60">
          <div className="flex flex-col justify-center items-center py-2 md:py-0">
            <span className="text-2xl lg:text-3.5xl font-extrabold text-[#3b82f6]">2,500+</span>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">MAHASISWA MAGANG</span>
          </div>
          <div className="flex flex-col justify-center items-center py-2 md:py-0">
            <span className="text-2xl lg:text-3.5xl font-extrabold text-[#3b82f6]">150+</span>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">PARTNER PERUSAHAAN</span>
          </div>
          <div className="flex flex-col justify-center items-center py-2 md:py-0">
            <span className="text-2xl lg:text-3.5xl font-extrabold text-[#3b82f6]">95%</span>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">KEPUASAN USER</span>
          </div>
          <div className="flex flex-col justify-center items-center py-2 md:py-0">
            <span className="text-2xl lg:text-3.5xl font-extrabold text-[#3b82f6]">12ms</span>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">KALKULASI CEPAT</span>
          </div>
        </div>
      </section>

      {/* 3. WHY US SECTION */}
      <section className="py-20 bg-[#fbfcfb]/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Features */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
                Kenapa Harus <br />
                <span className="text-[#3b82f6]">TegangKu?</span>
              </h2>
              <p className="text-xs lg:text-sm text-slate-500 leading-relaxed mt-4 max-w-xl font-medium">
                TegangKu membantu mahasiswa menemukan tempat magang yang paling sesuai dengan kemampuan, minat, dan jurusan melalui sistem rekomendasi cerdas. Temukan peluang magang terbaik di berbagai perusahaan dengan proses yang lebih mudah, cepat, dan tepat.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Feature 1 */}
              <div className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition duration-300">
                <div className="bg-blue-50 text-[#3b82f6] p-3 rounded-xl h-fit flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-slate-800">Jaringan Perusahaan Berkualitas</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    Akses ke berbagai perusahaan ternama, mulai dari startup teknologi hingga perusahaan multinasional yang aktif membuka program magang.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition duration-300">
                <div className="bg-blue-50 text-[#3b82f6] p-3 rounded-xl h-fit flex items-center justify-center">
                  <Compass size={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-slate-800">Pengalaman Kerja yang Terarah</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    Proyek magang didesain agar selaras dengan kebutuhan industri, memudahkan pengembangan skill yang relevan dengan karir masa depan.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition duration-300">
                <div className="bg-blue-50 text-[#3b82f6] p-3 rounded-xl h-fit flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-slate-800">Rekomendasi Cerdas Berbasis SPK</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    Gunakan algoritma pendukung keputusan (SAW & WP) untuk menemukan kecocokan terbaik antara profil akademis Anda dengan kriteria perusahaan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Skyscraper Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative group p-2 bg-white rounded-3xl border border-slate-100 shadow-md">
              <img 
                src={whyUsBuilding} 
                alt="Why Us Skyscraper" 
                className="w-full max-w-110 h-110 object-cover rounded-2xl transition duration-500"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 4. POPULAR INTERNSHIPS SECTION */}
      <section className="py-20 bg-[#fafbfe] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-10">
          
          {/* Header Row */}
          <div className="flex justify-between items-end w-full">
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
                Pilihan <span className="text-[#3b82f6]">Terpopuler</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Berdasarkan minat mahasiswa minggu ini</p>
            </div>
            <Link to="/rekomendasi" className="text-xs font-bold text-[#3b82f6] hover:underline flex items-center gap-1 transition">
              Jelajahi Semua
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularCompanies ? (
              // Sudah login -> data perusahaan asli dari database
              popularCompanies.map((c) => (
                <div key={c.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.01] transition duration-300 flex flex-col">
                  <div className="h-44 overflow-hidden relative bg-slate-100 flex items-center justify-center">
                    {c.logo ? (
                      <img src={c.logo} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={40} className="text-slate-300" />
                    )}
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <span className="text-[9px] font-bold text-white bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md select-none">
                        {c.bidangName}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-3 grow">
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">{c.name}</h3>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                      <span>{c.reviewCount > 0 ? c.averageRating.toFixed(1) : "Belum ada rating"}</span>
                      {c.reviewCount > 0 && (
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} fill="currentColor" className={i < Math.round(c.averageRating) ? "" : "text-slate-300"} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1 font-medium">
                        <MapPin size={12} className="text-[#3b82f6]" />
                        <span>{c.city}</span>
                      </div>
                      <Link to={`/perusahaan/${c.id}`} className="font-bold text-[#3b82f6] hover:underline flex items-center gap-0.5 transition">
                        Lihat Detail <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Belum login -> contoh ilustrasi (data asli baru bisa diakses setelah login)
              FALLBACK_COMPANIES.map((c) => (
                <div key={c.name} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.01] transition duration-300 flex flex-col">
                  <div className="h-44 overflow-hidden relative">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      {c.tags.map((tag) => (
                        <span key={tag} className="text-[9px] font-bold text-white bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md select-none">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-3 grow">
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">{c.name}</h3>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                      <span>{c.rating.toFixed(1)}</span>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill="currentColor" className={i < Math.round(c.rating) ? "" : "text-slate-300"} />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1 font-medium">
                        <MapPin size={12} className="text-[#3b82f6]" />
                        <span>{c.city}</span>
                      </div>
                      <Link to="/login" className="font-bold text-[#3b82f6] hover:underline flex items-center gap-0.5 transition">
                        Lihat Detail <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION (CTA) BANNER */}
      <section className="py-14 bg-white px-6">
        <div className="max-w-7xl mx-auto w-full bg-linear-to-r from-blue-500 to-blue-600 rounded-3xl p-8 lg:p-14 text-center text-white relative overflow-hidden shadow-xl">
          {/* Glowing circles decoration */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl mx-auto">
            <h2 className="text-2xl lg:text-3.5xl font-extrabold tracking-tight">
              Mulai Karir Profesionalmu <br /> Hari Ini.
            </h2>
            <p className="text-xs lg:text-sm text-blue-100 leading-relaxed mb-6 font-medium">
              Bergabung dengan 15.000+ mahasiswa IT yang telah bertransformasi dari pelajar menjadi profesional melalui ekosistem Magangku.
            </p>
            <Link 
              to="/rekomendasi" 
              className="bg-white hover:bg-slate-50 text-[#3b82f6] px-8 py-3.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
            >
              Cari Rekomendasi Sekarang
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}