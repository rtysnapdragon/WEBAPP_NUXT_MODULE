import { ref } from "vue";
import axios from "axios";

export const useAuth = async (args) => {
  const { str, config } = helper();
  const userCatch = useUserData().value;
  const isOnline = useOnline();
  const locale = useCookie(str.langCode).value;
  const deviceId = getDeviceId();
  const dbCode = useCookie(str.dbCode).value;
  const isActionLogin =
    isNotEmpty(args?.username) || isNotEmpty(args?.password);

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
      url: getUrl("/ocsauth/oauth"),
      headers: {
        Authorization: `basic ${config.basicKey}`,
        "Content-Type": "application/json",
        oc_device_id: deviceId,
      },
      method: "post",
      data: {
        Username: args?.username ?? "username",
        Password: args?.password ?? "password",
        RememberMe: args?.rememberMe ?? true,
        RefreshToken: isActionLogin ? null : userCatch?.refresh_token,
      },
    });

    let result = response.data;

    result = {
      token_type: result.token_type,
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_in: result.expires_in,
      expires: result.expires,
      refresh_lifetime: result.refresh_lifetime,
    };

    result.created_at = new Date();
    useUserData(result);
    useAuthorizeIframe({
      action: "set_authorize_cookie",
      data: {
        cookie: {
          oc_lang: locale ?? "en",
          oc_database: dbCode || "",
          oc_device_id: deviceId,
          oc_access_token: result.access_token,
          oc_expire: result.expires,
        },
        sameSite: config.sameSite,
      },
    });

    return { data: ref(result), error: ref(null) };
  } catch (e) {
    const data = e?.response?.data;
    if (data) {
      if (data.error == "invalid_grant" && !isActionLogin) {
        useCookie("oc_user_data").value = null;
        navigateTo(localePath("/login"));
      }
      return { error: ref(data), data: ref(null) };
    } else {
      return { error: ref(e), data: ref(null) };
    }
  }
};
