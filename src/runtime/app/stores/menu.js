import { defineStore, acceptHMRUpdate } from "#imports";

let menuInflight = null;

export const useMenuStore = defineStore("MenuStore", {
  state: () => ({
    loading: true,
    current: null,
    data: [],
    selected: null,
  }),
  getters: {
    getLoading: (state) => state.loading,
    getCurrent: (state) => state.current,
    getData: (state) => state.data,
    getSelectedData: (state) => {
      return state.data.filter((e) => e.title == state.selected);
    },
    getParent: (state) => {
      return state;
    },
  },
  actions: {
    setCurrent(data) {
      this.current = data;
    },
    getActionPermission(permission) {
      if (isEmpty(permission)) return 1;
      if (permission.toLowerCase() == "dev") return 1;
      const p = this.current?.actions?.find(
        (v) => v.Name.toLowerCase() == permission.toLowerCase()
      );
      if (isEmpty(p)) return 0;
      return p.Value;
    },
    setSelected(title) {
      this.selected = title;
    },
    clear() {
      this.data = [];
    },
    async get(force = false) {
      if (!force && this.data.length) {
        return this.data;
      }

      this.loading = true;

      try {
        const filtered = useMenu();

        this.data = filtered.value ?? [];

        return this.data;
      } finally {
        this.loading = false;
      }
    }
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMenuStore, import.meta.hot));
}
