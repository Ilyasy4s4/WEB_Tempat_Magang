import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "../Store/AuthStore";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, GraduationCap, Eye, EyeOff, ArrowRight } from "lucide-react";
import loginBgImg from "../assets/login-bg.png";

type FormData = {
  email: string;
  password: string;
};

const schema = z.object({
  email: z.string().min(1, "Email harus diisi").email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export default function LoginForm() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setIsLoading(true);

    try {
      const user = await login(data.email, data.password);

      // Redirect sesuai role:
      // - mahasiswa TETAP di halaman utama (bukan dashboard), sesuai desain sistem
      // - admin & super_admin masuk ke dashboard
      if (user.role === "mahasiswa") {
        navigate("/");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Email atau password salah.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-slate-50">

      {/* LEFT PANEL - BG IMAGE & QUOTE (Hidden on mobile) */}
      <div className="relative hidden md:flex md:w-[45%] lg:w-[40%] overflow-hidden select-none">
        {/* Background Image */}
        <img
          src={loginBgImg}
          alt="Login Background"
          className="absolute inset-0 w-full h-full object-cover filter brightness-90"
        />

        {/* Dark Blue Overlay */}
        <div className="absolute inset-0 bg-[#0a1833]/85 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute inset-0 bg-linear-to-t from-[#020617] via-transparent to-[#0a1833]/30 pointer-events-none"></div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col justify-center items-start p-10 lg:p-14 h-full text-white">
          {/* Large Quotes */}
          <span className="text-white/30 text-8xl font-serif leading-none select-none">"</span>

          {/* Quote Text */}
          <h1 className="text-3xl lg:text-4xl font-semibold leading-snug font-serif mt-2 tracking-wide">
            Menemukan magang impianku begitu mudah dengan, TegangKu!
          </h1>

          {/* Closing Quotes */}
          <span className="text-white/30 text-8xl font-serif leading-none select-none self-end -mt-4">"</span>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-[#f8fafc]">
        <div className="w-full max-w-110 flex flex-col">

          {/* Logo & Branding */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            <GraduationCap className="h-8 w-8 text-[#1e3a8a]" />
            <span className="text-4xl font-bold tracking-wide text-slate-900 font-sans">TegangKu</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-center md:text-left">Selamat Datang Kembali</h2>
          <p className="text-sm text-slate-500 mt-1 mb-8 text-center md:text-left">Lanjutkan perjalanan karier akademismu hari ini.</p>

          {serverError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Email Field */}
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
                  placeholder="ilmayas@gmail.com"
                  {...register("email")}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm outline-none transition-all
                    bg-white hover:border-slate-400
                    focus:ring-2 focus:ring-blue-100 focus:border-[#1e3a8a]/30
                    ${errors.email ? "border-red-500 bg-red-50 focus:ring-red-100" : "border-slate-200"}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-0.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Kata Sandi
                </label>
                <Link to="#" className="text-xs font-semibold text-[#1e3a8a] hover:underline">
                  Lupa Password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border text-sm outline-none transition-all
                    bg-white hover:border-slate-400
                    focus:ring-2 focus:ring-blue-100 focus:border-[#1e3a8a]/30
                    ${errors.password ? "border-red-500 bg-red-50 focus:ring-red-100" : "border-slate-200"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button - Blue */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-[#1e3a8a] text-white py-3.5 px-4 rounded-xl font-medium text-sm transition-all hover:bg-[#172e6e] hover:shadow-lg focus:outline-none active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? "Memproses..." : "Masuk"}</span>
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Redirect to Register */}
          <p className="text-sm text-slate-500 text-center mt-8">
            Belum punya akun?{" "}
            <Link to="/register" className="text-[#1e3a8a] font-bold hover:underline">
              Daftar Sekarang
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
