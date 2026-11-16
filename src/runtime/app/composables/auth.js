import { ref } from "vue";
import axios from "axios";
import {useAuthorizeIframe} from './useAuthorizeIframe'
import { useUserData } from './userData'

export const useAuth = async (args) => {
  console.log("args in composables auth useAuth -------------------> ", args)
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
      url: getUrl(
        !args.isNew
          ? "/api/v1/auth/login"
          : isRefreshing
            ? "/api/v1/auth/refresh"
            : "/api/v1/auth/register"
      ),
      headers: {
        Authorization: `basic ${config.basicKey}`,
        "Content-Type": "application/json",
        device_id: deviceId,
      },
      method: "post",
      data: {
        ...args,
        username: args?.username ?? "username",
        password: args?.password ?? "password",
        rememberMe: args?.remember_me ?? true,
        refreshToken: isActionLogin ? null : userCatch?.refresh_token || useCookie('r_refresh_token').value,
      },
    });

    let result = response.data?.data;
    console.log("result after auth --------- ",result)

    result = {
      token_type: result.tokenType,
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      expires_in: result.expires_in,
      expires: result.expires,
      refresh_lifetime: result.refresh_lifetime,
      organization_id: result.organizationId,
      roles: result.roles,
      permissions:result.permissions,
    };

    result.created_at = new Date();
    useUserData(result);
    useAuthorizeIframe({
      action: "set_authorize_cookie",
      data: {
        cookie: {
          lang: locale ?? "en",
          database: dbCode || "",
          device_id: deviceId,
          access_token: result.access_token,
          expire: result.expires,
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
        navigateTo(localePath("/login"));
      }
      return { error: ref(data), data: ref(null) };
    } else {
      return { error: ref(e), data: ref(null) };
    }
  }
};
