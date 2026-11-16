import CryptoJS from "crypto-js";
import { getAesKey } from "./aesKey";

export default (encryptedBase64, secretKey) => {
  if (isEmpty(encryptedBase64) || !secretKey) return "";

  try {
    const { key, options } = getAesKey(secretKey);
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, options);
    return decrypted.toString(CryptoJS.enc.Utf8) || "";
  } catch {
    return "";
  }
};
