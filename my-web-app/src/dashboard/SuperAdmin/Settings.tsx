import { useState, useEffect, type FormEvent } from "react";
import { User, Shield, BellRing, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { api } from "../../lib/api";
import { useAuthStore } from "../../Store/AuthStore";

const roleLabel: Record<string, string> = {
  super_admin: "Super Administrator",
  admin: "Administrator Kampus",
  mahasiswa: "Mahasiswa",
};

export default function Settings() {
  const updateUserInfo = useAuthStore((s) => s.updateUserInfo);

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");

  // Profil
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [role, setRole] = useState("");
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ===============================================
  // Ambil profil sendiri dari server saat halaman dibuka
  // ===============================================
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingProfile(true);
      try {
        const res = await api.getMyProfile();
        if (cancelled) return;
        setAdminName(res.data.name);
        setAdminEmail(res.data.email);
        setRole(res.data.role);
        setTenantName(res.data.tenantName);
      } catch (err: any) {
        if (!cancelled) {
          setMessage({ type: "error", text: err?.message || "Gagal memuat profil." });
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ===============================================
  // Simpan profil (nama & email)
  // ===============================================
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim()) {
      setMessage({ type: "error", text: "Nama dan email wajib diisi." });
      return;
    }

    setSavingProfile(true);
    setMessage(null);
    try {
      await api.updateMyProfile({ name: adminName.trim(), email: adminEmail.trim() });
      updateUserInfo({ name: adminName.trim(), email: adminEmail.trim() });
      setMessage({ type: "success", text: "Profil berhasil disimpan." });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Gagal menyimpan profil." });
    } finally {
      setSavingProfile(false);
    }
  };

  // ===============================================
  // Ganti password
  // ===============================================
  const handleSavePassword = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Semua kolom password wajib diisi." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password baru minimal 6 karakter." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password baru tidak cocok." });
      return;
    }

    setSavingPassword(true);
    try {
      await api.changeMyPassword({ oldPassword, newPassword });
      setMessage({ type: "success", text: "Password berhasil diubah." });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Gagal mengubah password." });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans w-full text-slate-700 select-none">
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Settings</h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Kelola profil dan keamanan akunmu sendiri.
        </p>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex gap-2 border-b border-slate-100 pb-2">
        <button
          onClick={() => {
            setActiveTab("profile");
            setMessage(null);
          }}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-none ${
            activeTab === "profile" ? "bg-blue-50 text-[#0252c7]" : "bg-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <User size={14} />
          <span>Profil</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("security");
            setMessage(null);
          }}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-none ${
            activeTab === "security" ? "bg-blue-50 text-[#0252c7]" : "bg-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Shield size={14} />
          <span>Keamanan &amp; Password</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("notifications");
            setMessage(null);
          }}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-none ${
            activeTab === "notifications" ? "bg-blue-50 text-[#0252c7]" : "bg-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <BellRing size={14} />
          <span>Notifikasi</span>
        </button>
      </div>

      {/* SETTINGS CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs max-w-2xl">
        {loadingProfile ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-6 justify-center">
            <Loader2 size={16} className="animate-spin" /> Memuat profil...
          </div>
        ) : (
          <>
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                <div className="flex flex-col gap-5">
                  <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase border-b border-slate-50 pb-2">
                    Identitas Diri
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700 font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Role Akses
                    </label>
                    <input
                      type="text"
                      value={roleLabel[role] || role}
                      readOnly
                      className="bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-400 outline-none select-none cursor-not-allowed"
                    />
                  </div>

                  {tenantName && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        Kampus
                      </label>
                      <input
                        type="text"
                        value={tenantName}
                        readOnly
                        className="bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-400 outline-none select-none cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-[#0252c7] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer active:scale-[0.98] select-none border-none shadow-xs"
                  >
                    {savingProfile ? "Menyimpan..." : "Simpan Profil"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={handleSavePassword} className="flex flex-col gap-6">
                <div className="flex flex-col gap-5">
                  <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase border-b border-slate-50 pb-2">
                    Ubah Password
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Password Lama
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Ulangi Password Baru
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi Password Baru"
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="bg-[#0252c7] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer active:scale-[0.98] select-none border-none shadow-xs"
                  >
                    {savingPassword ? "Menyimpan..." : "Ubah Password"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "notifications" && (
              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase border-b border-slate-50 pb-2">
                  Preferensi Notifikasi
                </h3>

                <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 font-semibold leading-relaxed">
                  Modul notifikasi email belum tersedia di backend, jadi preferensi di bawah ini
                  cuma tersimpan sementara di tampilan (belum kepersist ke server).
                </p>

                <div className="flex flex-col gap-3.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-650 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">Ulasan Masuk</span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Kirim email ketika ada ulasan baru yang butuh moderasi
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-650 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">Pendaftaran Mahasiswa</span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Kirim email ketika ada mahasiswa baru melakukan registrasi akun
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </>
        )}

        {message && (
          <div
            className={`flex items-start gap-2 text-xs rounded-xl p-3 mt-6 ${
              message.type === "success"
                ? "text-green-600 bg-green-50 border border-green-100"
                : "text-red-500 bg-red-50 border border-red-100"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}