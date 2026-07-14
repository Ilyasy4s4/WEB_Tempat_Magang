import { create } from 'zustand';
import { api } from '../lib/api';

export interface Kriteria {
  id: string;
  code: string;
  name: string;
  bobot: number; // = default_weight dari backend
  keterangan: string; // = description
  tipe: "Benefit" | "Cost"; // = type ("benefit" | "cost")
  source: "rating_mahasiswa" | "input_admin";
}

interface KriteriaState {
  kriteriaList: Kriteria[];
  loading: boolean;
  error: string | null;
  fetchKriteria: () => Promise<void>;
  addKriteria: (k: {
    code: string;
    name: string;
    bobot: number;
    keterangan: string;
    tipe: "Benefit" | "Cost";
    source: "rating_mahasiswa" | "input_admin";
  }) => Promise<void>;
  updateKriteria: (id: string, k: {
    code: string;
    name: string;
    bobot: number;
    keterangan: string;
    tipe: "Benefit" | "Cost";
    source: "rating_mahasiswa" | "input_admin";
  }) => Promise<void>;
  deleteKriteria: (id: string) => Promise<void>;
  getKriteriaById: (id: string) => Kriteria | undefined;
}

function mapKriteria(raw: any): Kriteria {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    bobot: Number(raw.default_weight),
    keterangan: raw.description || "",
    tipe: raw.type === "benefit" ? "Benefit" : "Cost",
    source: raw.source,
  };
}

function toPayload(k: {
  code: string;
  name: string;
  bobot: number;
  keterangan: string;
  tipe: "Benefit" | "Cost";
  source: "rating_mahasiswa" | "input_admin";
}) {
  return {
    code: k.code,
    name: k.name,
    type: k.tipe === "Benefit" ? "benefit" : "cost",
    default_weight: k.bobot,
    source: k.source,
    description: k.keterangan,
  };
}

export const useKriteriaStore = create<KriteriaState>()((set, get) => ({
  kriteriaList: [],
  loading: false,
  error: null,

  fetchKriteria: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.getCriteria();
      set({ kriteriaList: (res.data || []).map(mapKriteria), loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data kriteria.', loading: false });
    }
  },

  addKriteria: async (k) => {
    await api.createCriteria(toPayload(k));
    await get().fetchKriteria();
  },

  updateKriteria: async (id, k) => {
    await api.updateCriteria(id, toPayload(k));
    await get().fetchKriteria();
  },

  deleteKriteria: async (id) => {
    await api.deleteCriteria(id);
    set((state) => ({ kriteriaList: state.kriteriaList.filter((item) => item.id !== id) }));
  },

  getKriteriaById: (id) => get().kriteriaList.find((item) => item.id === id),
}));
