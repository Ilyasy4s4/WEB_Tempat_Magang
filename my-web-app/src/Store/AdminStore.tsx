import { create } from 'zustand';
import { api } from '../lib/api';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  tenantId: string | null;
  tenantName: string;
  createdAt: string;
}

interface CreateAdminPayload {
  tenantId: string;
  name: string;
  email: string;
  password: string;
}

interface UpdateAdminPayload {
  tenantId?: string;
  name: string;
  email: string;
}

interface AdminStoreState {
  admins: AdminAccount[];
  loading: boolean;
  error: string | null;
  fetchAdmins: () => Promise<void>;
  addAdmin: (admin: CreateAdminPayload) => Promise<void>;
  updateAdmin: (id: string, admin: UpdateAdminPayload) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
  getAdminById: (id: string) => AdminAccount | undefined;
}

// Backend model "users" tidak punya field status Aktif/Non-Aktif —
// field itu dulu cuma dummy di FE. GET /users mengembalikan SEMUA
// role (super_admin, admin, mahasiswa) lintas tenant, jadi di sini
// kita filter khusus role "admin" saja untuk halaman ini.
function mapAdmin(raw: any): AdminAccount {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    tenantId: raw.tenant_id || null,
    tenantName: raw.tenants?.name || "-",
    createdAt: raw.created_at ? new Date(raw.created_at).toLocaleDateString("id-ID") : "-",
  };
}

export const useAdminStore = create<AdminStoreState>()((set, get) => ({
  admins: [],
  loading: false,
  error: null,

  fetchAdmins: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.getUsers();
      const admins = (res.data || [])
        .filter((u: any) => u.role === "admin")
        .map(mapAdmin);
      set({ admins, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data admin.', loading: false });
    }
  },

  addAdmin: async (admin) => {
    await api.createAdmin(admin);
    await get().fetchAdmins();
  },

  updateAdmin: async (id, admin) => {
    await api.updateUser(id, admin);
    await get().fetchAdmins();
  },

  deleteAdmin: async (id) => {
    await api.deleteUser(id);
    set((state) => ({ admins: state.admins.filter((a) => a.id !== id) }));
  },

  getAdminById: (id) => get().admins.find((a) => a.id === id),
}));
