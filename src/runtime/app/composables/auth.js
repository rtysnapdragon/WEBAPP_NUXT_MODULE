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

    console.log("args -----> ", args);

    const response = await axios({
      url: getUrl(args.isNew ? "/api/v1/auth/register" : "/api/v1/auth/login"),
      headers: {
        "Content-Type": "application/json",
        r_device_id: deviceId,
      },
      method: "post",
      data: {
        username: args?.username ?? "username",
        password: args?.password ?? "password",
        remember: args?.remember ?? "remember",
      },
    });

    // Spring returns: { data: { accessToken, refreshToken, tokenType, userId, username, email, organizationId, roles, permissions } }
    const payload = response.data?.data ?? response.data;

    let result = {
      token_type: payload.tokenType ?? "Bearer",
      r_access_token: payload.accessToken,
      r_refresh_token: payload.refreshToken,
      expires_in: 86400,
      user_id: payload.userId,
      username: payload.username,
      email: payload.email,
      organization_id: payload.organizationId,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };

    result.created_at = new Date();
    useUserData(result);
    // useAuthorizeIframe({
    //   action: "set_authorize_cookie",
    //   data: {
    //     cookie: {
    //       r_lang: locale ?? "en",
    //       r_database: dbCode || "",
    //       r_device_id: deviceId,
    //       r_access_token: result.access_token,
    //       r_expire: result.expires,
    //     },
    //     sameSite: config.sameSite,
    //   },
    // });

    return { data: ref(result), error: ref(null) };
  } catch (e) {
    const data = e?.response?.data.data;
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
