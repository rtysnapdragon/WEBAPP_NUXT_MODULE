export const useAuthorizeIframe = authorizeIframe;

async function authorizeIframe(data, retry = 0) {
  const dom = window.document.getElementById("SETATHORIZECOOKIE");
  console.log("Dom ------------> ", dom)

  if (!dom && retry < 1000) {
    await new Promise((r) => setTimeout(r, 300));
    return authorizeIframe(data, retry + 1);
  }

  if (data) dom?.contentWindow.postMessage(data, "*");
  return ref(dom);
}


// For production, validate event.origin and use a specific targetOrigin instead of "*".