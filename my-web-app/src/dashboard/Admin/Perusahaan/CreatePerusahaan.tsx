import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { usePerusahaanAdminStore, type WorkMode } from "../../../Store/PerusahaanAdminStore";
import { useBidangStore } from "../../../Store/BidangStore";
import { api } from "../../../lib/api";
import { ArrowLeft, Building2, ImagePlus, Loader2, X } from "lucide-react";

export default function CreatePerusahaan() {
  const navigate = useNavigate();
  const addPerusahaan = usePerusahaanAdminStore((s) => s.addPerusahaan);
  const bidangList = useBidangStore((s) => s.bidangList);
  const fetchBidang = useBidangStore((s) => s.fetchBidang);

  useEffect(() => {
    if (bidangList.length === 0) fetchBidang();
  }, [bidangList.length, fetchBidang]);

  const [name, setName] = useState("");
  const [bidangId, setBidangId] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [address, setAddress] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>("WFO");
  const [kuota, setKuota] = useState("0");
  const [deskripsi, setDeskripsi] = useState("");
  const [status, setStatus] = useState<"Aktif" | "Non-Aktif">("Aktif");
  const [submitting, setSubmitting] = useState(false);

  // Logo perusahaan
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Set default bidang begitu daftar bidang selesai dimuat
  useEffect(() => {
    if (!bidangId && bidangList.length > 0) setBidangId(bidangList[0].id);
  }, [bidangList, bidangId]);

  const handlePickLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setLogoError("Format gambar harus JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Ukuran gambar maksimal 2MB.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { alert("Nama perusahaan harus diisi."); return; }
    if (!bidangId) { alert("Bidang harus dipilih."); return; }
    if (!lokasi.trim()) { alert("Lokasi (kota) harus diisi."); return; }

    setSubmitting(true);
    try {
      // Kalau ada file logo yang dipilih, upload dulu supaya dapat URL-nya
      let logoUrl: string | null = null;
      if (logoFile) {
        const uploadRes = await api.uploadCompanyLogo(logoFile);
        logoUrl = uploadRes.data.url;
      }

      await addPerusahaan({
        name,
        bidangId,
        lokasi,
        address,
        workMode,
        kuota: Number(kuota) || 0,
        deskripsi,
        status,
        logo: logoUrl,
      });
      alert(`Perusahaan "${name}" berhasil ditambahkan!`);
      navigate("/dashboard/manajemen-perusahaan");
    } catch (err: any) {
      alert(err.message || "Gagal menambahkan perusahaan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans w-full text-slate-700 select-none">
      <div className="flex flex-col gap-2">
        <button onClick={() => navigate("/dashboard/manajemen-perusahaan")} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-blue-600 transition cursor-pointer w-max bg-transparent border-none">
          <ArrowLeft size={12} /><span>Kembali ke Daftar Perusahaan</span>
        </button>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tambah Perusahaan Baru</h2>
        <p className="text-xs text-slate-400 font-medium">Isi formulir di bawah untuk mendaftarkan perusahaan mitra baru.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden flex flex-col">
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <Building2 size={14} className="text-blue-500" /> Informasi Perusahaan
          </h3>

          {/* LOGO UPLOAD */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Logo Perusahaan</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview logo" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus size={22} className="text-slate-300" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-[#2563eb] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition cursor-pointer border-none"
                  >
                    {logoPreview ? "Ganti Gambar" : "Pilih Gambar"}
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition cursor-pointer border-none"
                      title="Hapus gambar"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePickLogo}
                  className="hidden"
                />
                <span className="text-[10px] text-slate-400">JPG, PNG, atau WEBP. Maksimal 2MB.</span>
                {logoError && <span className="text-[10px] font-bold text-red-500">{logoError}</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nama Perusahaan <span className="text-red-500">*</span></label>
            <input id="p-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="contoh: PT Telkom Indonesia" className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="p-bidang" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Bidang <span className="text-red-500">*</span></label>
              <select id="p-bidang" value={bidangId} onChange={(e) => setBidangId(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700 cursor-pointer" required>
                <option value="" disabled>Pilih bidang</option>
                {bidangList.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="p-status" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status</label>
              <select id="p-status" value={status} onChange={(e) => setStatus(e.target.value as "Aktif" | "Non-Aktif")} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700 cursor-pointer">
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="p-lokasi" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Kota <span className="text-red-500">*</span></label>
              <input id="p-lokasi" type="text" value={lokasi} onChange={(e) => setLokasi(e.target.value)} placeholder="contoh: Jakarta Selatan" className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="p-workmode" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Mode Kerja</label>
              <select id="p-workmode" value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode)} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700 cursor-pointer">
                <option value="WFO">WFO</option>
                <option value="WFH">WFH</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="p-address" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Alamat</label>
              <input id="p-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Alamat lengkap kantor" className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="p-kuota" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Kuota Magang</label>
              <input id="p-kuota" type="number" min="0" value={kuota} onChange={(e) => setKuota(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-desc" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Deskripsi</label>
            <textarea id="p-desc" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsikan perusahaan ini..." rows={3} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700 resize-none" />
          </div>
        </div>

        <div className="bg-slate-50/50 border-t border-slate-100 px-8 py-5 flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate("/dashboard/manajemen-perusahaan")} className="text-xs font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer bg-transparent border-none py-2 px-4">Batalkan</button>
          <button type="submit" disabled={submitting} className="bg-[#2563eb] hover:bg-blue-600 disabled:opacity-60 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer active:scale-[0.98] border-none shadow-xs flex items-center gap-2">
            {submitting && <Loader2 size={13} className="animate-spin" />}
            {submitting ? "Menyimpan..." : "Simpan Perusahaan"}
          </button>
        </div>
      </form>
    </div>
  );
}