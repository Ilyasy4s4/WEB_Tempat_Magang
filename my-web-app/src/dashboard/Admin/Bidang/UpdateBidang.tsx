import { useState, useEffect, type FormEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useBidangStore } from "../../../Store/BidangStore";
import { useAuthStore } from "../../../Store/AuthStore";
import { ArrowLeft, Layers } from "lucide-react";

export default function UpdateBidang() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const bidangList = useBidangStore((s) => s.bidangList);
  const fetchBidang = useBidangStore((s) => s.fetchBidang);
  const getBidangById = useBidangStore((s) => s.getBidangById);
  const updateBidang = useBidangStore((s) => s.updateBidang);
  const role = useAuthStore((s) => s.user?.role);

  const [name, setName] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Hanya Super Admin yang boleh mengubah bidang (bidang bersifat global lintas kampus).
  if (role !== "super_admin") {
    return <Navigate to="/dashboard/bidang" replace />;
  }

  useEffect(() => {
    if (bidangList.length === 0) fetchBidang();
  }, [bidangList.length, fetchBidang]);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    const data = getBidangById(id);
    if (!data) { setNotFound(bidangList.length > 0); return; }
    setName(data.name);
    setNotFound(false);
  }, [id, getBidangById, bidangList]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!name.trim()) { alert("Nama bidang harus diisi."); return; }

    setSubmitting(true);
    try {
      await updateBidang(id, { name });
      alert(`Bidang "${name}" berhasil diperbarui!`);
      navigate("/dashboard/bidang");
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui bidang.");
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 font-sans text-slate-500">
        <Layers size={48} className="text-slate-300" />
        <h2 className="text-lg font-bold text-slate-700">Data Bidang Tidak Ditemukan</h2>
        <button onClick={() => navigate("/dashboard/bidang")} className="flex items-center gap-1.5 bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer border-none shadow-xs">
          <ArrowLeft size={12} /><span>Kembali</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-sans w-full text-slate-700 select-none">
      <div className="flex flex-col gap-2">
        <button onClick={() => navigate("/dashboard/bidang")} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-blue-600 transition cursor-pointer w-max bg-transparent border-none">
          <ArrowLeft size={12} /><span>Kembali ke Daftar Bidang</span>
        </button>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Edit Bidang</h2>
        <p className="text-xs text-slate-400 font-medium">Perbarui informasi bidang <span className="font-bold text-slate-600">{name}</span>.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden flex flex-col">
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <Layers size={14} className="text-blue-500" /> Informasi Bidang
          </h3>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bidang-name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nama Bidang <span className="text-red-500">*</span></label>
            <input id="bidang-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="contoh: Teknologi Informasi" className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700" required />
          </div>
        </div>

        <div className="bg-slate-50/50 border-t border-slate-100 px-8 py-5 flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate("/dashboard/bidang")} className="text-xs font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer bg-transparent border-none py-2 px-4">Batalkan</button>
          <button type="submit" disabled={submitting} className="bg-[#2563eb] hover:bg-blue-600 disabled:opacity-60 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer active:scale-[0.98] border-none shadow-xs">
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
