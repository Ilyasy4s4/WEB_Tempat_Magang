import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUniversitasStore } from "../../../Store/UniversitasStore";
import { ArrowLeft, GraduationCap, Loader2 } from "lucide-react";

export default function UpdateUniversitas() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const universities = useUniversitasStore((s) => s.universities);
  const loading = useUniversitasStore((s) => s.loading);
  const fetchUniversities = useUniversitasStore((s) => s.fetchUniversities);
  const getUniversityById = useUniversitasStore((s) => s.getUniversityById);
  const updateUniversity = useUniversitasStore((s) => s.updateUniversity);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Kalau store masih kosong (misal user langsung buka URL edit tanpa
  // lewat halaman index dulu), fetch ulang daftar tenant.
  useEffect(() => {
    if (universities.length === 0) {
      fetchUniversities();
    }
  }, [universities.length, fetchUniversities]);

  useEffect(() => {
    if (!id || loading) return;
    const uni = getUniversityById(id);
    if (!uni) {
      setNotFound(true);
      return;
    }
    setNotFound(false);
    setName(uni.name);
    setEmail(uni.email === "-" ? "" : uni.email);
    setAddress(uni.address === "-" ? "" : uni.address);
  }, [id, universities, loading, getUniversityById]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!name.trim()) {
      setError("Nama universitas harus diisi.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateUniversity(id, { name: name.trim(), email: email.trim(), address: address.trim() });
      navigate("/dashboard/universitas");
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui universitas.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && universities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 font-sans text-slate-400">
        <Loader2 size={28} className="animate-spin" />
        <span className="text-xs font-bold">Memuat data universitas...</span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 font-sans text-slate-500">
        <GraduationCap size={48} className="text-slate-300" />
        <h2 className="text-lg font-bold text-slate-700">Data Universitas Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400">
          ID universitas <span className="font-bold text-slate-600">{id}</span> tidak ada dalam database.
        </p>
        <button
          onClick={() => navigate("/dashboard/universitas")}
          className="flex items-center gap-1.5 bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer border-none shadow-xs"
        >
          <ArrowLeft size={12} />
          <span>Kembali ke Daftar Universitas</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-sans w-full text-slate-700 select-none">

      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => navigate("/dashboard/universitas")}
          className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-blue-600 transition cursor-pointer w-max bg-transparent border-none"
        >
          <ArrowLeft size={12} />
          <span>Kembali ke Daftar Universitas</span>
        </button>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Edit Universitas
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Perbarui informasi kampus mitra <span className="font-bold text-slate-600">{name}</span>.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-xs font-bold text-red-600 max-w-3xl">
          {error}
        </div>
      )}

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden flex flex-col">

        <div className="p-6 sm:p-8 flex flex-col gap-6">

          <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <GraduationCap size={14} className="text-blue-500" />
            Informasi Universitas
          </h3>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="uni-name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Nama Universitas <span className="text-red-500">*</span>
            </label>
            <input
              id="uni-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contoh: Universitas Indonesia"
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="uni-email" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Email Kontak
              </label>
              <input
                id="uni-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh: admin@kampus.ac.id"
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="uni-address" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Alamat
              </label>
              <input
                id="uni-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="contoh: Depok, Jawa Barat"
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700"
              />
            </div>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-slate-50/50 border-t border-slate-100 px-8 py-5 flex items-center justify-end gap-4 select-none">
          <button
            type="button"
            onClick={() => navigate("/dashboard/universitas")}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer select-none bg-transparent border-none py-2 px-4"
          >
            Batalkan
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer active:scale-[0.98] select-none border-none shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            Simpan Perubahan
          </button>
        </div>

      </form>
    </div>
  );
}
