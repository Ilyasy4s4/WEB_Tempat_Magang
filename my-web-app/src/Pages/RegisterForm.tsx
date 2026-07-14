import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { User, School, Mail, Lock, GraduationCap, Network, TrendingUp, Hash, BookOpen } from "lucide-react";
import registerTeamImg from "../assets/register-team.png";
import { useAuthStore } from "../Store/AuthStore";
import { api, type Tenant } from "../lib/api";

const schema = z.object({
  nama: z.string().min(1, "Nama lengkap harus diisi"),
  tenantId: z.string().min(1, "Kampus wajib dipilih"),
  nim: z.string().min(1, "NIM harus diisi"),
  jurusan: z.string().min(1, "Jurusan wajib dipilih"),
  email: z.string().min(1, "Email harus diisi").email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type FormData = z.infer<typeof schema>;

const JURUSAN_OPTIONS = [
  "Teknik Informatika",
  "Sistem Informasi",
  "Ilmu Komputer",
  "Teknik Komputer",
  "Sains Data / Data Science",
  "Teknologi Informasi",
  "Rekayasa Perangkat Lunak",
  "Manajemen Informatika",
];

const RegisterForm = () => {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [tenantSearch, setTenantSearch] = useState("");
  const [tenantOpen, setTenantOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });

  // Ambil daftar kampus dari backend (endpoint publik, tidak butuh login)
  useEffect(() => {
    api
      .getPublicTenants()
      .then((res) => setTenants(res.data))
      .catch(() => setServerError("Gagal memuat daftar kampus. Coba muat ulang halaman."))
      .finally(() => setLoadingTenants(false));
  }, []);

  const watchedTenantId = watch("tenantId");
  const watchedTenantName = tenants.find((t) => t.id === watchedTenantId)?.name;

  const filteredTenants = tenants.filter((t) =>
    t.name.toLowerCase().includes(tenantSearch.toLowerCase())
  );

  const handleSelectTenant = (tenant: Tenant) => {
    setValue("tenantId", tenant.id, { shouldValidate: true });
    setTenantOpen(false);
    setTenantSearch("");
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      await registerUser({
        name: data.nama,
        email: data.email,
        password: data.password,
        tenantId: data.tenantId,
        nim: data.nim,
        jurusan: data.jurusan,
      });

      // Setelah daftar berhasil, arahkan ke login (tidak auto-login)
      navigate("/login");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registrasi gagal, coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-slate-50">

      {/* LEFT PANEL - DECORATION (Hidden on mobile) */}
      <div className="relative hidden md:flex md:w-[45%] lg:w-[40%] bg-[#0f172a] text-white flex-col justify-between p-8 lg:p-12 overflow-hidden select-none">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Glowing gradient background elements */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
            <GraduationCap className="h-6 w-6 text-blue-400" />
          </div>
          <span className="text-xl font-bold tracking-wide font-sans">TegangKu</span>
        </div>

        {/* Middle Content */}
        <div className="relative z-10 flex flex-col gap-6 my-auto max-w-md">
          <h1 className="text-3xl lg:text-4xl font-semibold leading-tight font-sans">
            Investasi Masa Depan Karier Teknologi Anda.
          </h1>
          <p className="text-sm text-slate-300 font-sans leading-relaxed">
            Bergabunglah dengan ribuan mahasiswa berbakat yang telah menemukan jalur karier mereka melalui program magang eksklusif di perusahaan teknologi terkemuka.
          </p>

          {/* Benefit Cards */}
          <div className="flex flex-col gap-4 mt-2">
            {/* Networking Luas */}
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-2xl p-4 flex gap-4 hover:border-slate-600/50 transition duration-300">
              <div className="bg-blue-600/25 p-3 rounded-xl h-fit border border-blue-500/30">
                <Network className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Networking Luas</h3>
                <p className="text-xs text-slate-400 mt-1">Terhubung langsung dengan mentor industri.</p>
              </div>
            </div>

            {/* Pertumbuhan Eksponensial */}
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-2xl p-4 flex gap-4 hover:border-slate-600/50 transition duration-300">
              <div className="bg-blue-600/25 p-3 rounded-xl h-fit border border-blue-500/30">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Pertumbuhan Eksponensial</h3>
                <p className="text-xs text-slate-400 mt-1">Asah skill teknis dengan proyek nyata.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Team Photo */}
        <div className="relative z-10 mt-8 rounded-2xl overflow-hidden shadow-lg border border-slate-700/50">
          <img
            src={registerTeamImg}
            alt="Collaboration Team"
            className="w-full h-44 lg:h-48 object-cover filter brightness-90 hover:scale-105 transition duration-500"
          />
        </div>

      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-[#f8fafc]">
        <div className="w-full max-w-110 flex flex-col">

          {/* Logo only visible on mobile */}
          <div className="flex md:hidden items-center gap-2 mb-8 justify-center">
            <GraduationCap className="h-6 w-6 text-[#1e3a8a]" />
            <span className="text-xl font-bold tracking-wide text-slate-900">TegangKu</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Mulai Karier IT-mu</h2>
          <p className="text-sm text-slate-500 mt-1 mb-8">Lengkapi data diri untuk memulai perjalananmu.</p>

          {serverError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Nama Lengkap */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nama" className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Nama Lengkap
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400">
                  <User size={18} />
                </span>
                <input
                  id="nama"
                  type="text"
                  placeholder="Nama lengkapmu"
                  {...register("nama")}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm outline-none transition-all
                    bg-white hover:border-slate-400
                    focus:ring-2 focus:ring-blue-100 focus:border-[#1e3a8a]/30
                    ${errors.nama ? "border-red-500 bg-red-50 focus:ring-red-100" : "border-slate-200"}`}
                />
              </div>
              {errors.nama && (
                <p className="text-red-500 text-xs mt-0.5">{errors.nama.message}</p>
              )}
            </div>

            {/* Universitas / Kampus - sekarang dari data backend (bukan hardcode) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Kampus
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTenantOpen(!tenantOpen)}
                  disabled={loadingTenants}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm outline-none transition-all text-left flex items-center justify-between
                    bg-white hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed relative
                    ${tenantOpen ? "ring-2 ring-blue-100 border-[#1e3a8a]" : "border-slate-200"}
                    ${errors.tenantId ? "border-red-500 bg-red-50" : ""}`}
                >
                  <span className="absolute left-4 text-slate-400 pointer-events-none">
                    <School size={18} />
                  </span>

                  <span className={watchedTenantName ? "text-slate-800" : "text-slate-400"}>
                    {loadingTenants
                      ? "Memuat daftar kampus..."
                      : watchedTenantName || "Pilih Kampus"}
                  </span>

                  <span className="text-slate-400 text-xs transition-transform duration-200">
                    {tenantOpen ? "▲" : "▼"}
                  </span>
                </button>

                {/* Dropdown Options Box */}
                {tenantOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20 cursor-default"
                      onClick={() => setTenantOpen(false)}
                    />
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto flex flex-col">
                      {/* Search Input inside Dropdown */}
                      <div className="sticky top-0 bg-white p-2 border-b border-slate-100 flex gap-2 z-10">
                        <input
                          type="text"
                          placeholder="Cari kampus..."
                          value={tenantSearch}
                          onChange={(e) => setTenantSearch(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1e3a8a] bg-slate-50"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* List Items */}
                      <div className="py-1 z-10">
                        {filteredTenants.length > 0 ? (
                          filteredTenants.map((tenant) => (
                            <button
                              key={tenant.id}
                              type="button"
                              onClick={() => handleSelectTenant(tenant)}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer
                                ${watchedTenantId === tenant.id ? "bg-blue-50 text-[#1e3a8a] font-semibold" : "text-slate-700"}`}
                            >
                              {tenant.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs text-slate-400 text-center">
                            Kampus tidak ditemukan
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {errors.tenantId && (
                <p className="text-red-500 text-xs mt-0.5">{errors.tenantId.message}</p>
              )}
            </div>

            {/* NIM */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nim" className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                NIM
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400">
                  <Hash size={18} />
                </span>
                <input
                  id="nim"
                  type="text"
                  placeholder="Nomor Induk Mahasiswa"
                  {...register("nim")}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm outline-none transition-all
                    bg-white hover:border-slate-400
                    focus:ring-2 focus:ring-blue-100 focus:border-[#1e3a8a]/30
                    ${errors.nim ? "border-red-500 bg-red-50 focus:ring-red-100" : "border-slate-200"}`}
                />
              </div>
              {errors.nim && (
                <p className="text-red-500 text-xs mt-0.5">{errors.nim.message}</p>
              )}
            </div>

            {/* Jurusan */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="jurusan" className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Jurusan
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 pointer-events-none">
                  <BookOpen size={18} />
                </span>
                <select
                  id="jurusan"
                  {...register("jurusan")}
                  defaultValue=""
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm outline-none transition-all appearance-none cursor-pointer
                    bg-white hover:border-slate-400
                    focus:ring-2 focus:ring-blue-100 focus:border-[#1e3a8a]/30
                    ${errors.jurusan ? "border-red-500 bg-red-50 focus:ring-red-100" : "border-slate-200"}`}
                >
                  <option value="" disabled>Pilih jurusan</option>
                  {JURUSAN_OPTIONS.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>
              {errors.jurusan && (
                <p className="text-red-500 text-xs mt-0.5">{errors.jurusan.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="Ilmayas51@gmail.com"
                  {...register("email")}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm outline-none transition-all
                    bg-white hover:border-slate-400
                    focus:ring-2 focus:ring-blue-100 focus:border-[#1e3a8a]/30 focus:border-[#1e3a8a]
                    ${errors.email ? "border-red-500 bg-red-50 focus:ring-red-100" : "border-slate-200"}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-0.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm outline-none transition-all
                    bg-white hover:border-slate-400
                    focus:ring-2 focus:ring-blue-100 focus:border-[#1e3a8a]/30 focus:border-[#1e3a8a]
                    ${errors.password ? "border-red-500 bg-red-50 focus:ring-red-100" : "border-slate-200"}`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button - Blue */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-[#1e3a8a] text-white py-3.5 px-4 rounded-xl font-medium text-sm transition-all hover:bg-[#172e6e] hover:shadow-lg focus:outline-none active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          {/* Redirect to Login */}
          <p className="text-sm text-slate-500 text-center mt-8">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-[#1e3a8a] font-bold hover:underline">
              Masuk
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default RegisterForm;