import { defineStore, acceptHMRUpdate } from "pinia";
import { useToast } from "#imports";

export const useUserProfileStore = defineStore("UserProfileStore", {
  state: () => ({
    loading: true,
    dataUser: {},
    isSuccess: false,
    isSend: false,
    isChange: false,
    isChangeImage: false,
    permissions: [],

    isLoadingApiProcess: false, // use all request with api
    isNextToPageConfirm: false,
    isRequestSuccess: false, // use all respond from api

    // dataSignature: []
  }),
  getters: {
    getLoading: (state) => state.loading,
    getData: (state) => state.dataUser,
    // getDataSignature: (state) => state.dataSignature,
  },
  actions: {
    resetSuccess() {
      this.isSuccess = false;
      this.isSend = false;
    },

    async get(isSignature) {
      const { api } = helper();
      const toast = useToast();
      try {
        this.loading = true;

        const { data, error } = await useHttp(api.userInfo);

        if (error.value) throw error.value;

        if (isNotEmpty(data.value.data)) {
          this.dataUser = { ...data.value.data };
        }

        this.loading = false;
      } catch (e) {
        this.loading = false;
        toast.add({
          color: "red",
          title: `${e?.Message}`,
        });
      }
    },

    // get employee data by user
    async getEmployeeDetail(id) {
      const { api } = helper();
      try {
        const { data, error, status } = await useHttp(
          `api/employee/detail?EmployeeId=${id}`,
        );
        if (error.value) throw error.value;
        if (data.value) {
          this.dataUser.EmpDetail = isNotEmpty(data.value) ? data.value : {};
        }
      } catch (error) {
        this.toast.add({
          color: "red",
          title: error?.Message ?? error,
        });
      }
    },
    // Update Profile
    async updatedProfile(dataSend) {
      try {
        const { data, error, status } = await useHttp(api.userUpdate, {
          method: "post",
          data: dataSend,
        });

        if (error.value) throw error.value;

        if (data.value) {
          this.dataUser = { ...data.value };
          this.toast.add({
            color: "green",
            title: "Success update profile",
          });
          return data.value;
        }
      } catch (e) {
        this.toast.add({
          color: "red",
          title: `${e?.Message}`,
        });
      }
    },

    // Update Phone
    async updatedPhone(obj) {
      const { api } = helper();
      try {
        const { data, error, status } = await useHttp(api.userInfoChangePhone, {
          method: "post",
          data: obj,
        });
        if (error.value) throw error.value;
        if (data.value) {
          this.dataUser.Phone = obj.Phone;
          console.log("Update phone!!!", data.value);
          this.toast.add({
            color: "green",
            title: `Success update phone`,
          });
          return true;
        }
      } catch (e) {
        this.toast.add({
          color: "red",
          title: `${e?.Message}`,
        });
      }
    },

    // Update Email
    async updatedEmail(obj) {
      const { api } = helper();
      try {
        const { data, error, status } = await useHttp(api.userChangeEmail, {
          method: "post",
          data: obj,
        });

        if (error.value) throw error.value;

        if (data.value) {
          this.dataUser.Email = data.value.Status == "Success" ? obj.Email : ""; // assign email that edit

          this.toast.add({
            color: "green",
            title: `Success update Email`,
          });
          return data.value;
        }
      } catch (e) {
        this.toast.add({
          color: "red",
          title: `${e?.Message}`,
        });
      }
    },

    // Update Password
    async updatedPassword(obj) {
      const { api } = helper();
      try {
        const { data, error, status } = await useHttp(api.userChangePassword, {
          method: "post",
          data: obj,
        });

        if (error.value) throw error.value;

        if (data.value) {
          this.toast.add({
            color: "green",
            title: `Success update Password`,
          });
          return data.value;
        }
      } catch (e) {
        this.toast.add({
          color: "red",
          title: `${e?.Message}`,
        });
      }
    },

    async getSignature() {
      const { api } = helper();
      try {
        const _dataSignature = await useHttp(api.profile.signature.list);

        if (_dataSignature.error.value) throw _dataSignature.error.value;

        this.dataUser.Signature = isNotEmpty(_dataSignature.data.value)
          ? { ..._dataSignature.data.value[0] }
          : {};
      } catch (error) {
        this.toast.add({
          color: "red",
          title: `${error?.Message}`,
        });
      }
    },

    async deleteSignature(fn) {
      const { api } = helper();
      try {
        const { data, error, status } = await useHttp(
          `${api.profile.signature.delete}?employeeId=${this.dataUser?.ReferenceId}`,
        );

        if (error.value) throw error.value;

        if (data.value) {
          this.dataUser.Signature = {};

          if (fn) fn();
        }
      } catch (error) {
        this.toast.add({
          color: "red",
          title: `${error?.Message}`,
        });
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserProfileStore, import.meta.hot));
}
