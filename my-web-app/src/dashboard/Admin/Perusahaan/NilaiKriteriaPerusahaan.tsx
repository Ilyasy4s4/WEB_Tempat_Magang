import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../lib/api";
import { Save, Loader2, ArrowLeft, Lock } from "lucide-react";

interface CriteriaValueRow {
  id: string;
  criteriaId: string;
  criteriaName: string;
  source: "rating_mahasiswa" | "input_admin";
  value: number;
  editable: boolean;
}

// Kriteria yang namanya mengindikasikan nominal uang (Honor, Gaji, dll)
// ditampilkan dengan prefix "Rp" supaya jelas satuannya, tanpa perlu
// admin menambahkan konfigurasi apa pun -- cukup dari nama kriterianya.
const isMoneyCriteria = (name: string) =>
  /honor|gaji|upah|salary|stipend|uang saku|tunjangan/i.test(name);

export default function NilaiKriteriaPerusahaan() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [companyName, setCompanyName] = useState("");
  const [rows, setRows] = useState<CriteriaValueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getCompanyCriteria(id);
        setCompanyName(res.company);
        setRows(res.criteria as CriteriaValueRow[]);
      } catch (err: any) {
        setError(err.message || "Gagal memuat nilai kriteria.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (criteriaId: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.criteriaId === criteriaId ? { ...r, value: Number(value) } : r))
    );
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const editableRows = rows.filter((r) => r.editable);
      await api.updateCompanyCriteria(
        id,
        editableRows.map((r) => ({ criteriaId: r.criteriaId, value: r.value }))
      );
      navigate("/dashboard/manajemen-perusahaan");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan nilai kriteria.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans w-full select-none">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/manajemen-perusahaan")}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer bg-transparent border-none"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <span>Dashboard</span><span>/</span><span>Perusahaan</span><span>/</span>
            <span className="text-[#3b82f6]">Nilai Kriteria</span>
          </nav>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
            Nilai Kriteria {companyName ? `— ${companyName}` : ""}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Isi nilai kriteria yang bersumber dari admin (misal Honor). Kriteria dari rating
            mahasiswa dihitung otomatis dan tidak bisa diubah manual.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xs font-extrabold text-slate-700">Daftar Kriteria</h3>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 font-bold text-sm">
            <Loader2 size={18} className="animate-spin inline-block mr-2" /> Memuat data...
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-bold text-sm">
            Belum ada data kriteria untuk perusahaan ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div
                key={row.criteriaId}
                className="px-6 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">{row.criteriaName}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {row.source === "input_admin" ? "Diisi manual oleh admin" : "Otomatis dari rating mahasiswa"}
                  </span>
                </div>
                {row.editable ? (
                  <div className="flex flex-col items-end gap-1">
                    <div className="relative">
                      {isMoneyCriteria(row.criteriaName) && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                          Rp
                        </span>
                      )}
                      <input
                        type="number"
                        step="0.01"
                        value={row.value}
                        onChange={(e) => handleChange(row.criteriaId, e.target.value)}
                        className={`w-40 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 text-right focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${
                          isMoneyCriteria(row.criteriaName) ? "pl-8" : ""
                        }`}
                      />
                    </div>
                    {isMoneyCriteria(row.criteriaName) && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Rp {row.value.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-32 px-3 py-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-400 text-right flex items-center justify-end gap-1.5">
                    <Lock size={10} /> {row.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || loading || rows.length === 0}
          className="bg-[#2563eb] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-blue-600 active:scale-95 transition cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Simpan Nilai
        </button>
      </div>
    </div>
  );
}
