import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useKriteriaStore } from "../../../Store/KriteriaStore";
import { ArrowLeft, ClipboardList } from "lucide-react";

export default function UpdateKriteria() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const kriteriaList = useKriteriaStore((s) => s.kriteriaList);
  const fetchKriteria = useKriteriaStore((s) => s.fetchKriteria);
  const getKriteriaById = useKriteriaStore((s) => s.getKriteriaById);
  const updateKriteria = useKriteriaStore((s) => s.updateKriteria);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [bobot, setBobot] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [tipe, setTipe] = useState<"Benefit" | "Cost">("Benefit");
  const [source, setSource] = useState<"rating_mahasiswa" | "input_admin">("input_admin");
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (kriteriaList.length === 0) fetchKriteria();
  }, [kriteriaList.length, fetchKriteria]);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    const data = getKriteriaById(id);
    if (!data) { setNotFound(kriteriaList.length > 0); return; }
    setCode(data.code);
    setName(data.name);
    setBobot(String(data.bobot));
    setKeterangan(data.keterangan);
    setTipe(data.tipe);
    setSource(data.source);
    setNotFound(false);
  }, [id, getKriteriaById, kriteriaList]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!code.trim()) { alert("Kode kriteria harus diisi."); return; }
    if (!name.trim()) { alert("Nama kriteria harus diisi."); return; }
    const bobotNum = Number(bobot);
    if (isNaN(bobotNum) || bobotNum <= 0 || bobotNum > 100) { alert("Bobot harus antara 1 - 100."); return; }
    if (!keterangan.trim()) { alert("Keterangan harus diisi."); return; }

    setSubmitting(true);
    try {
      await updateKriteria(id, { code, name, bobot: bobotNum, keterangan, tipe, source });
      alert(`Kriteria "${name}" berhasil diperbarui!`);
      navigate("/dashboard/kriteria");
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui kriteria.");
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 font-sans text-slate-500">
        <ClipboardList size={48} className="text-slate-300" />
        <h2 className="text-lg font-bold text-slate-700">Data Kriteria Tidak Ditemukan</h2>
        <button onClick={() => navigate("/dashboard/kriteria")} className="flex items-center gap-1.5 bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer border-none shadow-xs">
          <ArrowLeft size={12} /><span>Kembali</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-sans w-full text-slate-700 select-none">
      <div className="flex flex-col gap-2">
        <button onClick={() => navigate("/dashboard/kriteria")} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-blue-600 transition cursor-pointer w-max bg-transparent border-none">
          <ArrowLeft size={12} /><span>Kembali ke Daftar Kriteria</span>
        </button>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Edit Kriteria</h2>
        <p className="text-xs text-slate-400 font-medium">Perbarui informasi kriteria <span className="font-bold text-slate-600">{name}</span>.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden flex flex-col">
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <ClipboardList size={14} className="text-blue-500" /> Informasi Kriteria
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="k-code" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Kode Kriteria <span className="text-red-500">*</span></label>
              <input id="k-code" type="text" value={code} onChange={(e) => setCode(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="k-name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nama Kriteria <span className="text-red-500">*</span></label>
              <input id="k-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="k-bobot" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Bobot (%) <span className="text-red-500">*</span></label>
              <input id="k-bobot" type="number" min="1" max="100" value={bobot} onChange={(e) => setBobot(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="k-tipe" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tipe Kriteria</label>
              <select id="k-tipe" value={tipe} onChange={(e) => setTipe(e.target.value as "Benefit" | "Cost")} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700 cursor-pointer">
                <option value="Benefit">Benefit (semakin tinggi semakin baik)</option>
                <option value="Cost">Cost (semakin rendah semakin baik)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="k-source" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sumber Nilai</label>
            <select id="k-source" value={source} onChange={(e) => setSource(e.target.value as "rating_mahasiswa" | "input_admin")} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700 cursor-pointer">
              <option value="input_admin">Input Admin (nilai diisi manual per perusahaan)</option>
              <option value="rating_mahasiswa">Rating Mahasiswa (dihitung dari ulasan)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="k-desc" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Keterangan <span className="text-red-500">*</span></label>
            <textarea id="k-desc" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} rows={3} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700 resize-none" required />
          </div>
        </div>

        <div className="bg-slate-50/50 border-t border-slate-100 px-8 py-5 flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate("/dashboard/kriteria")} className="text-xs font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer bg-transparent border-none py-2 px-4">Batalkan</button>
          <button type="submit" disabled={submitting} className="bg-[#2563eb] hover:bg-blue-600 disabled:opacity-60 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer active:scale-[0.98] border-none shadow-xs">
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
