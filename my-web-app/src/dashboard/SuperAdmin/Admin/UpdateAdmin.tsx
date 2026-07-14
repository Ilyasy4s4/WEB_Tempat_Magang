import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminStore } from "../../../Store/AdminStore";
import { api, type Tenant } from "../../../lib/api";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";

export default function UpdateAdmin() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const admins = useAdminStore((s) => s.admins);
  const loading = useAdminStore((s) => s.loading);
  const fetchAdmins = useAdminStore((s) => s.fetchAdmins);
  const getAdminById = useAdminStore((s) => s.getAdminById);
  const updateAdmin = useAdminStore((s) => s.updateAdmin);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (admins.length === 0) {
      fetchAdmins();
    }
    (async () => {
      try {
        const res = await api.getTenants();
        setTenants(res.data || []);
      } catch (err: any) {
        setError(err.message || "Gagal memuat daftar kampus.");
      }
    })();
  }, [admins.length, fetchAdmins]);

  useEffect(() => {
    if (!id || loading) return;
    const data = getAdminById(id);
    if (!data) { setNotFound(true); return; }
    setNotFound(false);
    setName(data.name);
    setEmail(data.email);
    setTenantId(data.tenantId || "");
  }, [id, admins, loading, getAdminById]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!name.trim()) { setError("Nama administrator harus diisi."); return; }
    if (!email.trim()) { setError("Email harus diisi."); return; }

    setSaving(true);
    setError(null);
    try {
      await updateAdmin(id, { tenantId: tenantId || undefined, name: name.trim(), email: email.trim() });
      navigate("/dashboard/admin-management");
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui admin.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && admins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 font-sans text-slate-400">
        <Loader2 size={28} className="animate-spin" />
        <span className="text-xs font-bold">Memuat data admin...</span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 font-sans text-slate-500">
        <Shield size={48} className="text-slate-300" />
        <h2 className="text-lg font-bold text-slate-700">Data Admin Tidak Ditemukan</h2>
        <button onClick={() => navigate("/dashboard/admin-management")} className="flex items-center gap-1.5 bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer border-none shadow-xs">
          <ArrowLeft size={12} /><span>Kembali</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-sans w-full text-slate-700 select-none">
      <div className="flex flex-col gap-2">
        <button onClick={() => navigate("/dashboard/admin-management")} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-blue-600 transition cursor-pointer w-max bg-transparent border-none">
          <ArrowLeft size={12} /><span>Kembali ke Manajemen Admin</span>
        </button>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Edit Admin</h2>
        <p className="text-xs text-slate-400 font-medium">Perbarui data administrator <span className="font-bold text-slate-600">{name}</span>.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-xs font-bold text-red-600 max-w-3xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden flex flex-col">
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <Shield size={14} className="text-blue-500" /> Kredensial Administrator
          </h3>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="adm-tenant" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Kampus</label>
            <select
              id="adm-tenant"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700 cursor-pointer"
            >
              <option value="">Pilih kampus...</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="adm-name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nama Lengkap <span className="text-red-500">*</span></label>
            <input id="adm-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="adm-email" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Email Address <span className="text-red-500">*</span></label>
            <input id="adm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700" required />
          </div>
        </div>

        <div className="bg-slate-50/50 border-t border-slate-100 px-8 py-5 flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate("/dashboard/admin-management")} className="text-xs font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer bg-transparent border-none py-2 px-4">Batalkan</button>
          <button type="submit" disabled={saving} className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer active:scale-[0.98] border-none shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving && <Loader2 size={12} className="animate-spin" />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
