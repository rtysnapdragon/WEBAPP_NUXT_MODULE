export default (path, isWeb) => {
  if (!path) return "No path provided";

  const { config } = helper();

  const tmpServer = useCookie("tmp_server").value;
  const tmpWebServer = useCookie("tmp_web_server").value;

  if (path.toLowerCase().startsWith("http")) return path;

  if (!path.startsWith("/")) path = `/${path}`;

  let server = isWeb
    ? isNotEmpty(tmpWebServer) ? tmpWebServer : config.webUrl
    : isNotEmpty(tmpServer)   ? tmpServer    : config.apiUrl;

  server = server?.endsWith("/") ? server.replace(/\/$/, "") : server;

  // Browsers block http:// requests from an https page (mixed content) —
  // except to localhost, which is allowed and usually has no TLS in dev.
  if (
    typeof window !== "undefined"
    && window.location.protocol === "https:"
    && !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(server || "")
  ) {
    server = server?.replace(/^http:\/\//i, "https://");
  }

  return `${server}${path}`;
};


// ~/composables/useServerUrls.ts
// import axios from 'axios'
// import { useCookie, useRuntimeConfig } from '#imports'

// export const getSUrl = async () => {
//   const config = useRuntimeConfig()
//   try {
//     const { data } = await axios.get(
//       `${config.public.apiBase}v1/url/get`
//     )
//     useCookie('tmp_server', {
//       path: '/',
//       secure: true
//     }).value = data.api_url
//     useCookie('tmp_web_server', {
//       path: '/',
//       secure: true
//     }).value = data.web_url
//   } catch (err) {
//     console.warn('Fallback server URLs used', err)
//     useCookie('tmp_server', {
//       path: '/',
//       secure: true
//     }).value = config.public.apiUrl
//     useCookie('tmp_web_server', {
//       path: '/',
//       secure: true
//     }).value = config.public.webUrl
//   }
// }
