import React from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0f172a] text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Column 1 - Brand Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl font-bold tracking-wide text-white font-sans">
              Tegang<span className="text-[#3b82f6]">ku</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            Platform rekomendasi profesional terbaik di Indonesia yang menghubungkan talenta berkualitas dengan perusahaan modern untuk masa depan yang lebih cerah.
          </p>
          <div className="flex gap-3 mt-2">
            <a 
              href="#" 
              className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition"
              title="Share"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </a>
            <a 
              href="#" 
              className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition"
              title="Instagram"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a 
              href="#" 
              className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition"
              title="Email"
            >
              <Mail size={14} />
            </a>
          </div>
        </div>

        {/* Column 2 - Perusahaan */}
        <div>
          <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-4">PERUSAHAAN</h4>
          <ul className="flex flex-col gap-2.5 text-xs">
            <li>
              <Link to="#" className="hover:text-white transition">Tentang Kami</Link>
            </li>
            <li>
              <Link to="#" className="hover:text-white transition">Karir</Link>
            </li>
            <li>
              <Link to="#" className="hover:text-white transition">Layanan</Link>
            </li>
            <li>
              <Link to="#" className="hover:text-white transition">Blog</Link>
            </li>
          </ul>
        </div>

        {/* Column 3 - Dukungan */}
        <div>
          <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-4">DUKUNGAN</h4>
          <ul className="flex flex-col gap-2.5 text-xs">
            <li>
              <Link to="#" className="hover:text-white transition">Pusat Bantuan</Link>
            </li>
            <li>
              <Link to="#" className="hover:text-white transition">Syarat & Ketentuan</Link>
            </li>
            <li>
              <Link to="#" className="hover:text-white transition">Kebijakan Privasi</Link>
            </li>
            <li>
              <Link to="#" className="hover:text-white transition">Kontak Kami</Link>
            </li>
          </ul>
        </div>

        {/* Column 4 - Dapatkan Info Terbaru */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold text-white tracking-widest uppercase">DAPATKAN INFO TERBARU</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Daftarkan email Anda untuk mendapatkan update lowongan kerja terbaru.
          </p>
          <form className="relative flex items-center" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Email Anda"
              className="w-full bg-[#1e293b] text-white pl-4 pr-24 py-3 rounded-xl border border-slate-700 text-xs outline-none focus:border-[#3b82f6] transition-all"
            />
            <button
              type="submit"
              className="absolute right-1 px-4 py-2 bg-[#3b82f6] text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Daftar</span>
              <ArrowRight size={12} />
            </button>
          </form>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <Mail size={14} className="text-[#3b82f6]" />
            <span>
              Email kami: <a href="mailto:support@tegangku.id" className="hover:underline">support@tegangku.id</a>
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Copyright line */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <div>
          &copy; 2026 Tegangku. All rights reserved. Professional Recruitment Platform.
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white select-none">ID</span>
          <span className="text-slate-700 select-none">|</span>
          <span className="hover:text-white cursor-pointer transition select-none">EN</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
