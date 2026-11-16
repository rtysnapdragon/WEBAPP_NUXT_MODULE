import axios from "axios";
import type { HttpOptions, Resp } from "../models/http.js";
import useOptions from "./useOptions";
import { ref, getCurrentInstance } from "vue";
import { useToast, useRefreshToken } from "#imports";
/**
 * const controller = new AbortController();

 * controller.abort();
*/

export const useHttp = async (
  url: string,
  options: HttpOptions = {}
): Promise<Resp> => {
  try {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline) {
      throw {
        response: {
          data: {
            Message: "No internet connection",
            StatusCode: 1001,
          },
        },
      };
    }

    // Proactively refresh if access token is expired (skip for login/refresh calls)
    if (!options?.isLogin) {
      await useRefreshToken();
    }

    const httpConfig = useOptions(url, options);
    if (!httpConfig) return { data: ref(null), error: ref(true) };

    const method = (httpConfig.options?.method ?? "get").trim().toLocaleLowerCase();
    const body = method !== "get"
      ? { data: httpConfig.options?.data }
      : { params: httpConfig.options?.data };

    let response: any;
    try {
      response = await axios({
        url: httpConfig.url,
        signal: options.signal,
        headers: httpConfig.options?.headers,
        method,
        ...body,
      });
    } catch (axiosErr: any) {
      // On 401: try one token refresh then retry the original request
      if (!options?.isLogin && axiosErr?.response?.status === 401) {
        const refreshed = await useRefreshToken(true);
        if (refreshed) {
          // Got a new token — retry with fresh auth header
          const retryConfig = useOptions(url, options);
          if (retryConfig) {
            response = await axios({
              url: retryConfig.url,
              signal: options.signal,
              headers: retryConfig.options?.headers,
              method,
              ...body,
            });
          }
        }
        // If refresh failed, useRefreshToken already called clearAuth + navigateTo('/auth/login').
        // Return silent empty response so the calling store doesn't show spurious error toasts.
        if (!response) return { data: ref(null), error: ref(null), status: 401 };
      } else {
        throw axiosErr;
      }
    }

    if (
      options?.alertSuccess != null &&
      typeof options?.alertSuccess == "object"
    ) {
      alertToast(
        options?.alertSuccess.title ?? "Success",
        options?.alertSuccess.description ?? "Request was successful",
        options?.alertSuccess.type ?? "success",
        options?.alertSuccess.color ?? "green"
      );
    } else if (options?.alertSuccess)
      alertToast("Success", "Request was successful", "success", "green");

    return { data: ref(response?.data), error: ref(null), status: response?.status };
  } catch (e: any) {
    if (options?.alertError != null && typeof options?.alertError == "object") {
      alertToast(
        options?.alertError.title ?? "Error",
        options?.alertError.description ??
        e.response?.data.Message ??
        "An error occurred",
        options?.alertError.type ?? "danger",
        options?.alertError.color ?? "red"
      );
    } else if (options?.alertError)
      alertToast(
        "Error",
        e.response?.data.Message ?? "An error occurred",
        "danger",
        "red"
      );
    return { data: ref(null), error: ref(e.response?.data), status: e.response?.status };
  }

  function alertToast(
    title: string,
    description: string,
    type: string,
    color: string
  ) {
    try {
      // useToast() requires setup context — safe when called from a component/composable,
      // but silently skipped when called from a Pinia action outside setup.
      if (getCurrentInstance()) {
        const toast = useToast();
        toast.add({ title, description, type, color });
      }
    } catch { /* no-op */ }
  }
};
