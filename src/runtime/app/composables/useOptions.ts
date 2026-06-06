import type { HttpOptions, HeaderResult } from "../models/http.js";
import { useCookie, useUserData } from "#imports";

export default function useOptions(
  url: string,
  options?: HttpOptions
): HeaderResult | undefined {
  const { str, config } = helper();
  const userCatch = useUserData().value;
  const locale = useCookie(str.langCode);
  const deviceId = getDeviceId();
  const lang = locale.value ?? "en";
  const dbCookie = useCookie(str.dbCode);
  let authorization = "";

  if (!options?.isGlobal && !userCatch) return;

  if (!options?.isGlobal) {
    const val: any = useUserData().value;

    authorization = `${val.token_type} ${val.access_token}`;
  } else {
    authorization = `basic ${config.basicKey}`;
  }

  let newHeader;

  if (isNotEmpty(options?.headers)) {
    newHeader = options?.headers;

    delete options?.headers;
  }

  options = {
    ...{
      headers: {
        ...{
          Authorization: authorization,
          "Content-Type": "application/json",
          Accept: "application/json, text/javascript, */*; q=0.01",
          lang,
          oc_device_id: deviceId,
          oc_database: dbCookie.value,
        },
        ...newHeader,
      },
    },
    ...options,
  };

  return { url: getUrl(url, options?.isWeb), options };
}
