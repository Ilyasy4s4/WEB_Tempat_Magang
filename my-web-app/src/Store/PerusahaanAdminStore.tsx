import { create } from 'zustand';
import { api } from '../lib/api';

export type WorkMode = "WFO" | "WFH" | "Hybrid";

export interface PerusahaanAdmin {
  id: string;
  name: string;
  bidangId: string;
  bidang: string; // nama bidang (untuk ditampilkan)
  lokasi: string; // = city
  address: string;
  workMode: WorkMode;
  kuota: number;
  deskripsi: string;
  status: "Aktif" | "Non-Aktif"; // = is_active
  logo: string | null;
  iconLetter: string;
  iconBg: string;
}

interface PerusahaanPayload {
  name: string;
  bidangId: string;
  lokasi: string;
  address: string;
  workMode: WorkMode;
  kuota: number;
  deskripsi: string;
  status: "Aktif" | "Non-Aktif";
  logo?: string | null;
}

interface PerusahaanAdminState {
  perusahaanList: PerusahaanAdmin[];
  loading: boolean;
  error: string | null;
  fetchPerusahaan: () => Promise<void>;
  addPerusahaan: (p: PerusahaanPayload) => Promise<void>;
  updatePerusahaan: (id: string, p: PerusahaanPayload) => Promise<void>;
  deletePerusahaan: (id: string) => Promise<void>;
  getPerusahaanById: (id: string) => PerusahaanAdmin | undefined;
}

const bgColors = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-purple-50 text-purple-600",
  "bg-amber-50 text-amber-600",
  "bg-rose-50 text-rose-600",
  "bg-indigo-50 text-indigo-600",
  "bg-teal-50 text-teal-600",
];

function generateIconLetter(name: string): string {
  return name.trim().split(" ").map(w => w[0]).join("").substring(0, 3).toUpperCase() || "PT";
}

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % bgColors.length;
  return bgColors[hash];
}

function mapCompany(raw: any): PerusahaanAdmin {
  return {
    id: raw.id,
    name: raw.name,
    bidangId: raw.bidang_id || raw.bidang?.id || "",
    bidang: raw.bidang?.name || "-",
    lokasi: raw.city || "",
    address: raw.address || "",
    workMode: raw.work_mode,
    kuota: raw.kuota ?? 0,
    deskripsi: raw.description || "",
    status: raw.is_active ? "Aktif" : "Non-Aktif",
    logo: raw.logo || null,
    iconLetter: generateIconLetter(raw.name),
    iconBg: colorFor(raw.id),
  };
}

function toPayload(p: PerusahaanPayload) {
  return {
    bidangId: p.bidangId,
    name: p.name,
    city: p.lokasi,
    address: p.address,
    work_mode: p.workMode,
    kuota: p.kuota,
    description: p.deskripsi,
    is_active: p.status === "Aktif",
    logo: p.logo ?? null,
  };
}

export const usePerusahaanAdminStore = create<PerusahaanAdminState>()((set, get) => ({
  perusahaanList: [],
  loading: false,
  error: null,

  fetchPerusahaan: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.getCompanies();
      set({ perusahaanList: (res.data || []).map(mapCompany), loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data perusahaan.', loading: false });
    }
  },

  addPerusahaan: async (p) => {
    await api.createCompany(toPayload(p));
    await get().fetchPerusahaan();
  },

  updatePerusahaan: async (id, p) => {
    await api.updateCompany(id, toPayload(p));
    await get().fetchPerusahaan();
  },

  deletePerusahaan: async (id) => {
    await api.deleteCompany(id);
    set((state) => ({ perusahaanList: state.perusahaanList.filter((item) => item.id !== id) }));
  },

  getPerusahaanById: (id) => get().perusahaanList.find((item) => item.id === id),
}));