import { ref } from "vue";
const secretKey = "rtuserdata";
const key = "r_user_data";

export const useUserData = (val) => {
  try {
    if (isNotEmpty(val) && typeof val == "object") {
      const data = encryptAES(JSON.stringify(val), secretKey);

      useCookie(key, {
        // maxAge: val.expires_in,
      }).value = data;
      useCookie("r_access_token").value = val.r_access_token;
      useCookie("r_refresh_token").value = val.r_refresh_token;

      return ref(val);
    } else {
      const data = useCookie(key).value;
      useCookie("r_access_token").value = val.r_access_token;
      useCookie("r_refresh_token").value = val.r_refresh_token;
      if (isNotEmpty(data)) {
        return ref(JSON.parse(decryptAES(data, secretKey)));
      } else {
        throw "Error";
      }
    }
  } catch (e) {
    return ref(null);
  }

  return userData;
};
