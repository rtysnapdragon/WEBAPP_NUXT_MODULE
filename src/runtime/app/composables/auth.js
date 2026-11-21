import { ref } from "vue";
import axios from "axios";
import { useUserData } from "./userData"

export const useAuth = async (args) => {
  console.log( "useAuth args ========== ", args)
  const { str, config } = helper();
  const userCatch = useUserData().value;
  const isOnline = useOnline();
  const locale = useCookie(str.langCode).value;
  const deviceId = getDeviceId();
  const dbCode = useCookie(str.dbCode).value;
  const isActionLogin = isNotEmpty(args?.username) || isNotEmpty(args?.password);
  try {
    if (!isOnline.value) {
      throw {
        response: {
          data: {
            Message: "No internet connection",
            StatusCode: 1001,
          },
        },
      };
    }

    const response = await axios({
      url: getUrl(args.isNew ? '/api/v1/auth/register' : args.isRefresh ? '/api/v1/auth/refresh':"/api/v1/auth/login"),
      headers: {
        "Content-Type": "application/json",
        r_device_id: deviceId,
      },
      method: "post",
      data: {
        ...args,
        username: args?.username ?? "",
        password: args?.password ?? "",
        remember: args?.remember ?? "",
        refreshToken: isActionLogin? null : args?.refreshToken ?? "",
      },
    });

    // Spring returns: { data: { accessToken, refreshToken, tokenType, userId, username, email, organizationId, roles, permissions } }
    const payload = response.data?.data ?? response.data;
    console.log("Payload ------------------- ",payload)

    let result = {
      token_type: payload.tokenType ?? 'Bearer',
      access_token: payload.accessToken,
      refresh_token: payload.refreshToken,
      expires_in: 86400,
      organization_id: payload.organizationId,
    };

    result.created_at = new Date();
    useUserData(result);
    useAuthorizeIframe({
      action: "set_authorize_cookie",
      data: {
        cookie: {
          r_lang: locale ?? "en",
          r_database: dbCode || "",
          r_device_id: deviceId,
          r_access_token: result.access_token,
          r_expire: result.expires,
        },
        sameSite: config.sameSite,
      },
    });

    return { data: ref(result), error: ref(null) };
  } catch (e) {
    const data = e?.response?.data;
    if (data) {
      if (data.error == "invalid_grant" && !isActionLogin) {
        useCookie("r_user_data").value = null;
        navigateTo("/auth/login");
      }
      return { error: ref(data), data: ref(null) };
    } else {
      return { error: ref(e), data: ref(null) };
    }
  }
};
