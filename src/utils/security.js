const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiReportHacking(reason) {
  try {
    const res = await fetch(`${API_BASE}/security/report-hacking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error reporting security event:', err);
    return { blocked: false };
  }
}

export async function apiTrackView() {
  try {
    const res = await fetch(`${API_BASE}/stats/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error tracking page view:', err);
    return { ok: false };
  }
}

export function initSecurityListeners(onBlock, onWarning) {
  // Check if already blocked in localStorage
  if (localStorage.getItem('sys_lockdown') === 'true') {
    onBlock();
    return;
  }

  let attemptCount = 0;

  const triggerBlock = async (reason) => {
    attemptCount++;
    console.warn(`[SECURITY ALERT] Suspicious activity: ${reason}. Attempt ${attemptCount}/3`);
    
    // Send event to server
    const data = await apiReportHacking(reason);
    
    if (data.blocked || attemptCount >= 3) {
      localStorage.setItem('sys_lockdown', 'true');
      onBlock();
    } else {
      if (onWarning) {
        onWarning(attemptCount);
      }
    }
  };

  // 1. Disable Right Click Context Menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    triggerBlock('Clic droit interdit');
  };
  document.addEventListener('contextmenu', handleContextMenu);

  // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
  const handleKeyDown = (e) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      triggerBlock('Touche F12 pressée');
    }
    
    // Ctrl + Shift + I/J/C
    if (isCtrl && isShift && ['I', 'J', 'C'].includes(e.key?.toUpperCase())) {
      e.preventDefault();
      triggerBlock(`Raccourci inspecteur détecté (Ctrl+Shift+${e.key})`);
    }

    // Ctrl + U
    if (isCtrl && e.key?.toUpperCase() === 'U') {
      e.preventDefault();
      triggerBlock('Raccourci source détecté (Ctrl+U)');
    }

    // Ctrl + S
    if (isCtrl && e.key?.toUpperCase() === 'S') {
      e.preventDefault();
      triggerBlock('Raccourci sauvegarde détecté (Ctrl+S)');
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  // 3. DevTools resize detection
  let isChecking = false;
  const checkDevTools = () => {
    if (isChecking) return;
    isChecking = true;
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      triggerBlock('Ouverture inspecteur par redimensionnement');
    }
    setTimeout(() => { isChecking = false; }, 500);
  };
  window.addEventListener('resize', checkDevTools);
  
  // Return cleanup
  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', checkDevTools);
  };
}
