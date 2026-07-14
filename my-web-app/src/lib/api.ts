const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// =========================================================
// request()
// Wrapper fetch dasar. Otomatis:
// - nyisipin header Authorization kalau ada token tersimpan
// - lempar Error kalau response bukan 2xx, dengan pesan dari backend
// =========================================================
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(body?.message || res.statusText || "Request gagal");
  }

  return body as T;
}

// =========================================================
// uploadFile()
// Sama seperti request(), tapi khusus untuk multipart/form-data
// (upload file). TIDAK menyetel header Content-Type secara manual -
// browser yang menentukan boundary multipart-nya sendiri.
// =========================================================
async function uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(body?.message || res.statusText || "Upload gagal");
  }

  return body as T;
}

// =========================================================
// Tipe-tipe dasar yang dipakai berulang
// (disederhanakan, cukup untuk kebutuhan UI - bukan tipe Prisma penuh)
// =========================================================
export type Role = "super_admin" | "admin" | "mahasiswa";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId: string | null;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface Tenant {
  id: string;
  name: string;
}

export const api = {
  // ================= AUTH =================
  login: (data: { email: string; password: string }) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    tenantId: string;
    nim: string;
    jurusan?: string;
  }) =>
    // Backend (auth.controller.ts) balikin { message, data: {...} }, bukan { user }
    request<{ message: string; data: Pick<AuthUser, "id" | "name" | "email" | "role"> }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  me: () => request<{ user: AuthUser }>("/me"),

  // ================= TENANTS (kampus) =================
  getPublicTenants: () => request<{ message: string; data: Tenant[] }>("/tenants/public"),
  getTenants: () => request<{ message: string; data: any[] }>("/tenants"),
  createTenant: (data: any) =>
    request<any>("/tenants", { method: "POST", body: JSON.stringify(data) }),
  updateTenant: (id: string, data: any) =>
    request<any>(`/tenants/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTenant: (id: string) => request<any>(`/tenants/${id}`, { method: "DELETE" }),

  // ================= USERS (super_admin & admin) =================
  createAdmin: (data: any) =>
    request<any>("/users/admin", { method: "POST", body: JSON.stringify(data) }),
  getUsers: () => request<{ message: string; data: any[] }>("/users"),
  getUserById: (id: string) => request<any>(`/users/${id}`),
  updateUser: (id: string, data: any) =>
    request<any>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id: string) => request<any>(`/users/${id}`, { method: "DELETE" }),
  getMahasiswaList: () => request<{ message: string; data: any[] }>("/users/mahasiswa/list"),

  // ================= PROFIL SENDIRI (siapapun yang login) =================
  getMyProfile: () =>
    request<{
      message: string;
      data: { id: string; name: string; email: string; role: Role; tenantId: string | null; tenantName: string | null };
    }>("/users/me/profile"),
  updateMyProfile: (data: { name?: string; email?: string }) =>
    request<{ message: string; data: { id: string; name: string; email: string } }>(
      "/users/me/profile",
      { method: "PUT", body: JSON.stringify(data) }
    ),
  changeMyPassword: (data: { oldPassword: string; newPassword: string }) =>
    request<{ message: string }>("/users/me/password", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // ================= BIDANG =================
  getBidang: () => request<{ message: string; data: any[] }>("/bidang"),
  getBidangById: (id: string) => request<any>(`/bidang/${id}`),
  createBidang: (data: any) =>
    request<any>("/bidang", { method: "POST", body: JSON.stringify(data) }),
  updateBidang: (id: string, data: any) =>
    request<any>(`/bidang/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBidang: (id: string) => request<any>(`/bidang/${id}`, { method: "DELETE" }),

  // ================= CRITERIA =================
  getCriteria: () => request<{ message: string; data: any[] }>("/criteria"),
  getCriteriaById: (id: string) => request<any>(`/criteria/${id}`),
  createCriteria: (data: any) =>
    request<any>("/criteria", { method: "POST", body: JSON.stringify(data) }),
  updateCriteria: (id: string, data: any) =>
    request<any>(`/criteria/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCriteria: (id: string) => request<any>(`/criteria/${id}`, { method: "DELETE" }),

  // ================= COMPANIES =================
  getCompanies: () => request<{ message: string; data: any[] }>("/companies"),
  getCompanyById: (id: string) => request<{ message: string; data: any }>(`/companies/${id}`),
  createCompany: (data: any) =>
    request<any>("/companies", { method: "POST", body: JSON.stringify(data) }),
  updateCompany: (id: string, data: any) =>
    request<any>(`/companies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCompany: (id: string) => request<any>(`/companies/${id}`, { method: "DELETE" }),
  uploadCompanyLogo: (file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    return uploadFile<{ message: string; data: { url: string } }>("/companies/upload-logo", formData);
  },

  // ================= COMPANY CRITERIA VALUES (nilai Honor, dst) =================
  // NOTE: path harus /company-criteria/company/:id/criteria, sesuai
  // companyCriteria.route.ts di BE (bukan /company-criteria/:id saja).
  getCompanyCriteria: (companyId: string) =>
    request<{ company: string; criteria: any[] }>(`/company-criteria/company/${companyId}/criteria`),
  updateCompanyCriteria: (companyId: string, criteria: { criteriaId: string; value: number }[]) =>
    request<any>(`/company-criteria/company/${companyId}/criteria`, {
      method: "PUT",
      body: JSON.stringify({ criteria }),
    }),

  // ================= REVIEWS (rating mahasiswa) =================
  createReview: (data: {
    companyId: string;
    comment?: string;
    ratings: { criteriaId: string; rating: number }[];
  }) => request<any>("/reviews", { method: "POST", body: JSON.stringify(data) }),

  getCompanyReviews: (companyId: string) =>
    request<{
      message: string;
      averageRating: number;
      count: number;
      data: {
        id: string;
        userName: string;
        comment: string | null;
        createdAt: string;
        averageRating: number;
        ratings: { criteriaId: string; criteriaName: string; rating: number }[];
      }[];
    }>(`/reviews/company/${companyId}`),

  // Untuk halaman moderasi Ulasan (dashboard admin/super_admin).
  // admin: hanya ulasan di kampusnya. super_admin: semua ulasan lintas kampus.
  getReviews: () =>
    request<{
      message: string;
      data: {
        id: string;
        userName: string;
        companyId: string;
        companyName: string;
        comment: string | null;
        createdAt: string;
        averageRating: number;
        ratings: { criteriaId: string; criteriaName: string; rating: number }[];
      }[];
    }>("/reviews"),

  deleteReview: (id: string) => request<{ message: string }>(`/reviews/${id}`, { method: "DELETE" }),

  // ================= RECOMMENDATIONS (SAW) =================
  createRecommendationRequest: (data: {
    bidangId?: string;
    city?: string;
    work_mode?: "WFO" | "WFH" | "Hybrid";
    weights: { criteriaId: string; weight: number }[];
  }) => request<any>("/recommendations", { method: "POST", body: JSON.stringify(data) }),

  getRecommendationResult: (requestId: string) =>
    request<{ message: string; weights: any[]; data: any[] }>(
      `/recommendations/${requestId}/results`
    ),

  getRecommendationHistory: (userId: string) =>
    request<{ message: string; data: any[] }>(`/recommendations/history/${userId}`),
};