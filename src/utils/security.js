/** Clear any legacy client-side lockdown flags from older security builds. */
export function clearSecurityLockdown() {
  try {
    localStorage.removeItem('sys_lockdown');
  } catch {
    // ignore
  }
}

/** No-op — tracking disabled. */
export async function apiTrackView() {
  return { ok: true };
}

/** No-op — security reporting disabled. */
export async function apiReportHacking() {
  return { blocked: false };
}

/** No-op — security listeners disabled. */
export function initSecurityListeners() {
  clearSecurityLockdown();
  return () => {};
}
