const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

const host =
  typeof window !== "undefined"
    ? window.location.hostname
    : "localhost";

// Match the page's protocol so an https page never calls an http:// API.
// localhost is exempt: browsers allow http://localhost from https pages.
const isLoopback = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(host);
const protocol =
  typeof window !== "undefined" && window.location.protocol === "https:" && !isLoopback
    ? "https"
    : "http";

const serverUrl =
  import.meta.env.VITE_API_URL ||
  `${protocol}://${host}:${import.meta.env.VITE_SERVER_PORT || 8080}`;

export default {
  BASE_URL,
  webUrl: import.meta.env.VITE_WEB_URL || "http://localhost:3001",
  apiUrl: serverUrl,

  // Do not expose real secrets in frontend code.
  apiPaths: {
    otherEndpoints: {
      login: "api/v1/auth/login",
    },
    setup: {
      createPhase: "api/v1/phases/create",
    },
  },
};