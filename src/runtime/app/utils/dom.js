// SSR-safe DOM helpers used by RGridLayout (document direction + window listeners).
// Fixes in this version: `hasDocument` / `hasWindow` were referenced but never *called*
// (a function reference is always truthy, so the guards never worked), `getDocumentDir`
// could return '' / null, and `setDocumentDir` could not remove the attribute again.

let currentDir = 'ltr'

const hasDocument = () => typeof document !== 'undefined'
const hasWindow = () => typeof window !== 'undefined'

/** 'ltr' | 'rtl' — never an empty string. */
export function getDocumentDir() {
  if (!hasDocument()) return currentDir
  const html = document.documentElement
  const direction = html.getAttribute('dir') || document.dir
  return direction === 'rtl' ? 'rtl' : 'ltr'
}

/** Sets <html dir>. Pass a falsy value to remove the attribute. */
export function setDocumentDir(dir) {
  if (!hasDocument()) {
    currentDir = dir === 'rtl' ? 'rtl' : 'ltr'
    return
  }
  const html = document.documentElement
  if (dir) html.setAttribute('dir', dir)
  else html.removeAttribute('dir')
}

export function addWindowEventListener(event, callback = () => {}) {
  if (!hasWindow()) return
  window.addEventListener(event, callback)
}

export function removeWindowEventListener(event, callback = () => {}) {
  if (!hasWindow()) return
  window.removeEventListener(event, callback)
}