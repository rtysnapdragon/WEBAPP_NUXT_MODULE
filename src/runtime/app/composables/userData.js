import { ref } from "vue";
import encryptAES from './encryptAES'
import decryptAES from './decryptAES'
const secretKey = "rtuserdata";
const key = "r_user_data";


export const useUserData = (val) => {
  try {
    useCookie('r_access_token').value = val.access_token
    useCookie('r_refresh_token').value = val.refresh_token;
    if (isNotEmpty(val) && typeof val == "object") {
      const data = encryptAES(JSON.stringify(val), secretKey);

      useCookie(key, {
        maxAge: val.expires_in,
      }).value = data;
      return ref(val);
    } else {
      const data = useCookie(key).value;

      if (isNotEmpty(data)) {
        return ref(JSON.parse(decryptAES(data, secretKey)));
      } else {
        throw "Error";
      }
    }
  } catch (e) {
    return ref(null);
  }
};