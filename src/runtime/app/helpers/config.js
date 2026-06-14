const BASE_URL =
  process.env.NUXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  (process.env.NODE_ENV === "production" ? process.env.API_URL_PROD : process.env.API_URL_DEV);

export default {
  BASE_URL: BASE_URL || 'http://localhost:8080',
  webUrl: BASE_URL || 'http://localhost:3001',
  apiUrl: BASE_URL || 'http://localhost:8080',
  basicKey: process.env.BASIC_KEY || 'xxfbghvhbkjlktyiopopýVCXsdwa$334345324#weFZcZVFXB',
  apiPaths: {
    otherEndpoints: {
      login: 'api/v1/auth/login',
    },
    setup:{
      createPhase: "api/v1/phases/create",
    }
  }
};
  