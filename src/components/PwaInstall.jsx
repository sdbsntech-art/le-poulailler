import { useState, useEffect } from 'react';

export default function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) setInstalled(true);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandalone = window.navigator.standalone === true;
    if (isIos && !isInStandalone) setShowIosHint(true);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        registerSW({
          immediate: true,
          onNeedRefresh() {
            setUpdateReady(true);
          },
          onOfflineReady() {
            /* cache prêt */
          },
        });
      })
      .catch(() => {
        /* dev sans plugin */
      });
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setDeferredPrompt(null);
    }
  }

  function handleRefresh() {
    window.location.reload();
  }

  if (installed && !updateReady) return null;

  return (
    <div className="pwa-banner" role="region" aria-label="Installation application">
      {updateReady && (
        <div className="pwa-banner__inner">
          <p>Une nouvelle version est disponible.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleRefresh}>
            Mettre à jour
          </button>
        </div>
      )}

      {!updateReady && deferredPrompt && !installed && (
        <div className="pwa-banner__inner">
          <p>
            <strong>Installer Le Poulailler</strong> — accès rapide hors ligne sur votre téléphone ou ordinateur.
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleInstall}>
            Télécharger l&apos;app
          </button>
        </div>
      )}

      {!updateReady && showIosHint && !installed && !deferredPrompt && (
        <div className="pwa-banner__inner pwa-banner__inner--ios">
          <p>
            <strong>iPhone / iPad :</strong> Safari → bouton <strong>Partager</strong>, puis{' '}
            <strong>Sur l&apos;écran d&apos;accueil</strong>.
          </p>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowIosHint(false)}
            aria-label="Masquer l'aide iOS"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
