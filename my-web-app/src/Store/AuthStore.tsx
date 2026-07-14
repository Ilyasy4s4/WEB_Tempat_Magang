import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setToken, clearToken, type AuthUser, type Role } from "../lib/api";

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;

  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    tenantId: string;
    nim: string;
    jurusan?: string;
  }) => Promise<void>;
  logout: () => void;

  // helper untuk dipakai di komponen (misal cek role tanpa banyak destructure)
  role: () => Role | null;
  tenantId: () => string | null;

  // Dipanggil setelah update profil (Settings) berhasil, supaya nama/email
  // yang tampil di header/sidebar langsung ikut berubah tanpa perlu login ulang.
  updateUserInfo: (data: Partial<Pick<AuthUser, "name" | "email">>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,

      // ===============================
      // LOGIN
      // Memanggil POST /auth/login yang sungguhan.
      // Kalau berhasil: simpan token (localStorage, lewat setToken di api.ts)
      // + simpan data user (termasuk role & tenantId) ke store.
      // ===============================
      login: async (email, password) => {
        const res = await api.login({ email, password });

        setToken(res.token);

        set({
          isAuthenticated: true,
          user: res.user,
          token: res.token,
        });

        return res.user;
      },

      // ===============================
      // REGISTER
      // Khusus mahasiswa (self-register). Setelah berhasil,
      // TIDAK otomatis login - user diarahkan ke halaman login
      // supaya alurnya jelas (daftar dulu, baru masuk).
      // ===============================
      register: async (data) => {
        await api.register(data);
      },

      // ===============================
      // LOGOUT
      // ===============================
      logout: () => {
        clearToken();
        set({ isAuthenticated: false, user: null, token: null });
      },

      role: () => get().user?.role ?? null,
      tenantId: () => get().user?.tenantId ?? null,

      updateUserInfo: (data) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...data } });
      },
    }),
    {
      name: "auth-storage",
      version: 2, // dinaikkan supaya localStorage lama (versi dummy) tidak dipakai lagi
    }
  )
);