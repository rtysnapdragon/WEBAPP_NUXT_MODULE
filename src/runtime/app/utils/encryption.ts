// // ~/utils/encryption.ts
// import CryptoJS from 'crypto-js';

// const SECRET_KEY = 'shrshrefgsm5tw45t43yu56jhrtsgrdsg'; // NOT secure for production // must match what you used in Django

// export function encrypt(value: string): string {
//   return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
// }


import CryptoJS from 'crypto-js'

export function encrypt(value: string): string {
  const config = useRuntimeConfig()
  return CryptoJS.AES.encrypt(value, config.public.encryptionKey).toString()
}
