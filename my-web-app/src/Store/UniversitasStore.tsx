import { create } from 'zustand';
import { api } from '../lib/api';

export type SubscriptionStatus = "trial" | "active" | "expired";

export interface University {
  id: string;
  name: string;
  slug: string;
  email: string;
  address: string;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  iconLetter: string;
  iconBg: string;
}

interface UniversitasPayload {
  name: string;
  email: string;
  address: string;
}

interface UniversitasState {
  universities: University[];
  loading: boolean;
  error: string | null;
  fetchUniversities: () => Promise<void>;
  addUniversity: (uni: UniversitasPayload) => Promise<void>;
  updateUniversity: (id: string, uni: UniversitasPayload) => Promise<void>;
  deleteUniversity: (id: string) => Promise<void>;
  getUniversityById: (id: string) => University | undefined;
}

const bgColors = [
  "bg-yellow-50 text-yellow-600",
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-indigo-50 text-indigo-600",
  "bg-purple-50 text-purple-600",
  "bg-rose-50 text-rose-600",
  "bg-teal-50 text-teal-600",
];

function generateIconLetter(name: string): string {
  return name.trim().split(" ").map(w => w[0]).join("").substring(0, 3).toUpperCase() || "UNI";
}

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % bgColors.length;
  return bgColors[hash];
}

// Backend model "tenants" cuma punya { id, name, slug, email, address,
// subscription_status, created_at, updated_at }. Tidak ada field
// "type"/"accreditation"/"students" seperti versi dummy sebelumnya.
function mapTenant(raw: any): University {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    email: raw.email || "-",
    address: raw.address || "-",
    subscriptionStatus: raw.subscription_status || "trial",
    createdAt: raw.created_at ? new Date(raw.created_at).toLocaleDateString("id-ID") : "-",
    iconLetter: generateIconLetter(raw.name),
    iconBg: colorFor(raw.id),
  };
}

export const useUniversitasStore = create<UniversitasState>()((set, get) => ({
  universities: [],
  loading: false,
  error: null,

  fetchUniversities: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.getTenants();
      set({ universities: (res.data || []).map(mapTenant), loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data universitas.', loading: false });
    }
  },

  addUniversity: async (uni) => {
    await api.createTenant(uni);
    await get().fetchUniversities();
  },

  updateUniversity: async (id, uni) => {
    await api.updateTenant(id, uni);
    await get().fetchUniversities();
  },

  deleteUniversity: async (id) => {
    await api.deleteTenant(id);
    set((state) => ({ universities: state.universities.filter((u) => u.id !== id) }));
  },

  getUniversityById: (id) => get().universities.find((u) => u.id === id),
}));
