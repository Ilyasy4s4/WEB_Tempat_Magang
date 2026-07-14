import { create } from 'zustand';
import { api } from '../lib/api';

export interface Bidang {
  id: string;
  name: string;
  slug: string;
  iconBg: string;
}

interface BidangState {
  bidangList: Bidang[];
  loading: boolean;
  error: string | null;
  fetchBidang: () => Promise<void>;
  addBidang: (b: { name: string }) => Promise<void>;
  updateBidang: (id: string, b: { name: string }) => Promise<void>;
  deleteBidang: (id: string) => Promise<void>;
  getBidangById: (id: string) => Bidang | undefined;
}

const bgColors = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-purple-50 text-purple-600",
  "bg-amber-50 text-amber-600",
  "bg-rose-50 text-rose-600",
  "bg-indigo-50 text-indigo-600",
  "bg-teal-50 text-teal-600",
  "bg-cyan-50 text-cyan-600",
];

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % bgColors.length;
  return bgColors[hash];
}

// Backend model "bidang" cuma punya { id, name, slug, created_at, updated_at }.
// iconBg dihitung di FE saja (bukan data asli dari server) supaya tampilan tetap berwarna.
function mapBidang(raw: any): Bidang {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    iconBg: colorFor(raw.id),
  };
}

export const useBidangStore = create<BidangState>()((set, get) => ({
  bidangList: [],
  loading: false,
  error: null,

  fetchBidang: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.getBidang();
      set({ bidangList: (res.data || []).map(mapBidang), loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data bidang.', loading: false });
    }
  },

  addBidang: async (b) => {
    await api.createBidang(b);
    await get().fetchBidang();
  },

  updateBidang: async (id, b) => {
    await api.updateBidang(id, b);
    await get().fetchBidang();
  },

  deleteBidang: async (id) => {
    await api.deleteBidang(id);
    set((state) => ({ bidangList: state.bidangList.filter((item) => item.id !== id) }));
  },

  getBidangById: (id) => get().bidangList.find((item) => item.id === id),
}));
