import CryptoJS from "crypto-js";
import { getAesKey } from "./aesKey";

export default (text, secretKey, cutSpace) => {
  try {
    if (isEmpty(text)) return "";

    text = cutSpace
      ? text.replace(/[\n\s]+/g, "")
      : text.replace(/[\n]+/g, "");

    const { key, options } = getAesKey(secretKey);
    return CryptoJS.AES.encrypt(text, key, options).toString().trim();
  } catch {
    return "";
  }
};
