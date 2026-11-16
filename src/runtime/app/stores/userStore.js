// stores/userStore.js — Users connected to Spring API
// GET/POST/PUT/DELETE /api/v1/users, GET /users/me
// POST/DELETE /api/v1/users/{userId}/roles/{roleId}
import { defineStore, acceptHMRUpdate } from "pinia";

const fromApi = (u) => ({
  id: u.id,
  username: u.username ?? "",
  email: u.email ?? "",
  firstName: u.firstName ?? "",
  lastName: u.lastName ?? "",
  fullName: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
  gender: u.gender ?? "",
  phone: u.phone ?? "",
  avatar: u.avatar ?? "",
  status: u.status ?? "ACTIVE",
  roles: u.roles ?? [],
  organizationId: u.organizationId,
});

const toApi = (form) => ({
  username: form.username,
  email: form.email ?? "",
  password: form.password ?? undefined,
  firstName: form.firstName ?? "",
  lastName: form.lastName ?? "",
  gender: form.gender ?? "",
  phone: form.phone ?? "",
  status: form.status ?? "ACTIVE",
});

export const useUserStore = defineStore("userStore", {
  state: () => ({
    items: [],
    me: null,
    loading: false,
    page: 0,
    totalPages: 0,
    totalElements: 0,
  }),

  getters: {
    activeUsers: (state) => state.items.filter((u) => u.status === "ACTIVE"),
    getUserById: (state) => (id) => state.items.find((u) => u.id === id),
    myFullName: (state) =>
      state.me
        ? `${state.me.firstName ?? ""} ${state.me.lastName ?? ""}`.trim()
        : "",
  },

  actions: {
    async fetchMe() {
      try {
        const { data, error, status } = await useHttp("/api/v1/users/me", {
          method: "GET",
          isGlobal: true,
        });
        this.me = fromApi(data.value?.data ?? data.value);
      } catch {}
    },

    async fetchUsers(p = 0, search = "") {
      this.loading = true;
      try {
        const { data } = await useHttp("/api/v1/users/list", {
          method: "POST",
          body: {
            page: p + 1,
            pageSize: 20,
            search: search || "",
            sort: { field: "createdAt", direction: "DESC" },
          },
          isGlobal: true,
        });
        const result = data.value?.data ?? data.value;
        const content = result?.content ?? result ?? [];
        this.items = Array.isArray(content) ? content.map(fromApi) : [];
        this.totalPages = result?.totalPages ?? 1;
        this.totalElements = result?.totalElements ?? this.items.length;
        this.page = p;
      } finally {
        this.loading = false;
      }
    },

    async addUser(form) {
      const { data, error } = await useHttp("/api/v1/users", {
        method: "POST",
        body: toApi(form),
        isGlobal: true,
      });
      if (error.value) return { success: false, error: error.value };
      const created = fromApi(data.value?.data ?? data.value ?? {});
      await this.fetchUsers(this.page);
      return { success: true, data: created };
    },

    async updateUser(userId, form) {
      const payload = toApi(form);
      if (!payload.password) delete payload.password;
      const { error } = await useHttp(`/api/v1/users/${userId}`, {
        method: "PUT",
        body: payload,
        isGlobal: true,
      });
      if (error.value) return { success: false, error: error.value };
      await this.fetchUsers(this.page);
      return { success: true };
    },

    async deleteUser(userId) {
      const { error } = await useHttp(`/api/v1/users/${userId}`, {
        method: "DELETE",
        isGlobal: true,
      });
      if (error.value) return { success: false, error: error.value };
      const idx = this.items.findIndex((u) => u.id === userId);
      if (idx !== -1) this.items.splice(idx, 1);
      return { success: true };
    },

    async assignRole(userId, roleId) {
      const { error } = await useHttp(
        `/api/v1/users/${userId}/roles/${roleId}`,
        {
          method: "POST",
          isGlobal: true,
        },
      );
      if (error.value) return { success: false, error: error.value };
      await this.fetchUsers(this.page);
      return { success: true };
    },

    async removeRole(userId, roleId) {
      const { error } = await useHttp(
        `/api/v1/users/${userId}/roles/${roleId}`,
        {
          method: "DELETE",
          isGlobal: true,
        },
      );
      if (error.value) return { success: false, error: error.value };
      await this.fetchUsers(this.page);
      return { success: true };
    },
  },
});

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
