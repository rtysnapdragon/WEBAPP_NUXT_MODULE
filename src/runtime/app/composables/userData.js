import { useCookie, useState } from "#imports";

const secretKey = "userdataytjkdfksdafafinsgfdgrdsdfsfasvsd";
// Secret used by an older module build. Kept for backward compatibility so
// sessions written before the key was aligned can still be read.
const legacySecretKey = "rtuserdata";
const key = "r_user_data";

const ACCESS_COOKIE = "r_access_token";
const REFRESH_COOKIE = "r_refresh_token";

const DEFAULT_ACCESS_MAX_AGE = 60 * 60 * 24;
const DEFAULT_REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

const cookieOptions = (maxAge) => ({
  path: "/",
  sameSite: "lax",
  maxAge,
});

function toMaxAge(value, fallback) {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : fallback;
}

function readStoredUserData() {
  try {
    const raw = useCookie(key, { path: "/" }).value;
    if (!isNotEmpty(raw)) return null;

    let json = decryptAES(raw, secretKey);
    if (!isNotEmpty(json)) json = decryptAES(raw, legacySecretKey);
    if (!isNotEmpty(json)) return null;

    return JSON.parse(json);
  } catch (e) {
    console.error("[useUserData] Failed to read session cookie:", e);
    return null;
  }
}

export const useUserData = (val) => {
  // `useState` keeps the decrypted session in memory so every `useHttp` call
  // does not have to re-decrypt the cookie.
  const userData = useState("r_user_data_state", readStoredUserData);

  if (isNotEmpty(val) && typeof val === "object") {
    userData.value = val;

    try {
      const encrypted = encryptAES(JSON.stringify(val), secretKey);
      const accessMaxAge = toMaxAge(val.expires_in, DEFAULT_ACCESS_MAX_AGE);
      const refreshMaxAge = toMaxAge(
        val.refresh_lifetime,
        DEFAULT_REFRESH_MAX_AGE,
      );

      useCookie(key, cookieOptions(refreshMaxAge)).value = encrypted;

      if (val.access_token) {
        useCookie(ACCESS_COOKIE, cookieOptions(accessMaxAge)).value =
          val.access_token;
      }

      if (val.refresh_token) {
        useCookie(REFRESH_COOKIE, cookieOptions(refreshMaxAge)).value =
          val.refresh_token;
      }
    } catch (e) {
      console.error("[useUserData] Failed to persist session cookie:", e);
    }
  }

  return userData;
};
