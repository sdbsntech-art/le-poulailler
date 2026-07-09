import { useState, useMemo, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { usePoulailler } from './hooks/usePoulailler';
import { useProfil } from './hooks/useProfil';
import { useAlertes } from './hooks/useAlertes';
import { useLiveClock } from './hooks/useLiveClock';
import { useRappelEngine } from './hooks/useRappelEngine';
import { computeStatsGlobales, getEffectifLot } from './utils/phases';
import { buildToutesAlertes, enrichirStatutAlertes, getAlertesUrgentes } from './utils/scheduler';
import StatsCards from './components/StatsCards';
import LotForm from './components/LotForm';
import LotCard from './components/LotCard';
import SanteView from './components/SanteView';
import PwaInstall from './components/PwaInstall';
import LiveTotals from './components/LiveTotals';
import QuickRecord from './components/QuickRecord';
import ParametresForm from './components/ParametresForm';
import ComptePanel from './components/ComptePanel';
import AlertesPanel from './components/AlertesPanel';
import AlimentationPanel from './components/AlimentationPanel';
import ConseilsView from './components/ConseilsView';
import ImportantBanner from './components/ImportantBanner';
import AppFooter from './components/AppFooter';
import RappelBanner from './components/RappelBanner';
import TrialBanner from './components/TrialBanner';
import { apiTrackView } from './utils/security';
import AdminPanel from './components/AdminPanel';
import './App.css';

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'conseils', label: 'Conseils' },
  { id: 'alertes', label: 'Alertes' },
  { id: 'alimentation', label: 'Alimentation' },
  { id: 'sante', label: 'Santé' },
  { id: 'parametres', label: 'Paramètres' },
  { id: 'compte', label: 'Mon compte' },
];

export default function App() {
  const { isAuthenticated, notificationPrefs, token, loading: authLoading } = useAuth();
  const [tab, setTab] = useState(() => {
    if (window.location.pathname === '/admin') return 'admin';
    const t = new URLSearchParams(window.location.search).get('tab');
    if (t === 'admin') return 'admin';
    return TABS.some((x) => x.id === t) ? t : 'dashboard';
  });
  const now = useLiveClock(15000);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  const { lots, ajouterLot, supprimerLot, enregistrerDeces, enregistrerVente, hydrated } = usePoulailler();
  const { profil, enregistrerProfil } = useProfil();
  const { completedIds, marquerFait, annulerFait, messageLog, ajouterMessageLog } = useAlertes();

  useEffect(() => {
    apiTrackView().catch(() => {});

    const handleAdminShortcut = (e) => {
      if (e.ctrlKey && e.altKey && e.key?.toUpperCase() === 'A') {
        e.preventDefault();
        setTab('admin');
      }
    };
    window.addEventListener('keydown', handleAdminShortcut);

    return () => {
      window.removeEventListener('keydown', handleAdminShortcut);
    };
  }, []);

  // Écouter les clics sur les notifications transmis par l'application mobile
  useEffect(() => {
    const handleWebViewMessage = (event) => {
      try {
        let payload = event.data;
        if (typeof payload === 'string') {
          payload = JSON.parse(payload);
        }
        if (payload && payload.type === 'NOTIFICATION_CLICKED') {
          console.log('[App.jsx] Notification mobile cliquée, redirection vers les alertes...');
          setTab('alertes');
        }
      } catch (e) {
        // Ignorer les messages malformés
      }
    };

    window.addEventListener('message', handleWebViewMessage);
    document.addEventListener('message', handleWebViewMessage);
    return () => {
      window.removeEventListener('message', handleWebViewMessage);
      document.removeEventListener('message', handleWebViewMessage);
    };
  }, []);

  useRappelEngine(lots, profil, {
    completedIds,
    ajouterMessageLog,
    enabled: profil.rappelsConfigures,
    browserAlerts: isAuthenticated && notificationPrefs.browserAlerts,
    token,
    notificationPrefs,
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.pathname === '/admin') {
      url.pathname = '/';
    }
    if (tab === 'dashboard') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tab);
    }
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  }, [tab]);

  const alertesEnrichies = useMemo(
    () =>
      enrichirStatutAlertes(
        buildToutesAlertes(lots, {
          horairesRepas: profil.horairesRepas,
          horairesEau: profil.horairesEau,
          now,
        }),
        completedIds,
        now,
        profil
      ),
    [lots, profil, completedIds, now]
  );

  const stats = computeStatsGlobales(lots);
  const nbUrgentes = getAlertesUrgentes(alertesEnrichies).length;
  const lotsActifs = lots.filter((l) => getEffectifLot(l) > 0);

  if (authLoading) {
    return (
      <div className="app app--loading">
        <p>Chargement…</p>
      </div>
    );
  }

  return (
    <div className="app">
      <PwaInstall />
      <TrialBanner onOpenCompte={() => setTab('compte')} />
      <RappelBanner
        alertes={alertesEnrichies}
        onVoirAlertes={() => setTab('alertes')}
        onFait={marquerFait}
      />
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__logo" aria-hidden="true">
            🐔
          </div>
          <div>
            <h1>Le Poulailler</h1>
            <p className="app-header__tagline">
              Gestion d&apos;élevage — conseils, phases automatiques & suivi quotidien
            </p>
          </div>
        </div>
        
        {/* Navigation Desktop classique */}
        <nav className="nav-tabs" aria-label="Navigation principale">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`nav-tab ${tab === t.id ? 'nav-tab--active' : ''}`}
              onClick={() => {
                setTab(t.id);
                setMenuOpen(false);
              }}
            >
              {t.label}
              {t.id === 'alertes' && nbUrgentes > 0 && (
                <span className="nav-tab__badge">{nbUrgentes}</span>
              )}
              {t.id === 'compte' && !isAuthenticated && (
                <span className="nav-tab__badge nav-tab__badge--gold">!</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bouton Burger Mobile */}
        <button
          className={`burger-btn ${menuOpen ? 'burger-btn--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu principal"
          aria-expanded={menuOpen}
        >
          <span className="burger-btn__line"></span>
          <span className="burger-btn__line"></span>
          <span className="burger-btn__line"></span>
        </button>

        {/* Tiroir de Navigation Mobile */}
        <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
          <div className="mobile-menu__overlay" onClick={() => setMenuOpen(false)}></div>
          <div className="mobile-menu__content">
            <div className="mobile-menu__header">
              <div className="mobile-menu__brand">
                <div className="app-header__logo" aria-hidden="true">
                  🐔
                </div>
                <div>
                  <span className="mobile-menu__title">Le Poulailler</span>
                  <p className="mobile-menu__subtitle">Gestion d'élevage</p>
                </div>
              </div>
              <button
                className="mobile-menu__close"
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
              >
                ✕
              </button>
            </div>
            <nav className="mobile-menu__nav">
              {TABS.map((t) => {
                let icon = '📊';
                if (t.id === 'conseils') icon = '💡';
                else if (t.id === 'alertes') icon = '🔔';
                else if (t.id === 'alimentation') icon = '🌾';
                else if (t.id === 'sante') icon = '🏥';
                else if (t.id === 'parametres') icon = '⚙️';
                else if (t.id === 'compte') icon = '👤';

                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`mobile-menu__link ${tab === t.id ? 'mobile-menu__link--active' : ''}`}
                    onClick={() => {
                      setTab(t.id);
                      setMenuOpen(false);
                    }}
                  >
                    <span className="mobile-menu__link-icon">{icon}</span>
                    <span className="mobile-menu__link-label">{t.label}</span>
                    {t.id === 'alertes' && nbUrgentes > 0 && (
                      <span className="nav-tab__badge">{nbUrgentes}</span>
                    )}
                    {t.id === 'compte' && !isAuthenticated && (
                      <span className="nav-tab__badge nav-tab__badge--gold">!</span>
                    )}
                  </button>
                );
              })}
              
              {/* Onglet secret admin dans le burger menu s'il est actif */}
              {tab === 'admin' && (
                <button
                  type="button"
                  className="mobile-menu__link mobile-menu__link--active"
                  onClick={() => {
                    setTab('admin');
                    setMenuOpen(false);
                  }}
                >
                  <span className="mobile-menu__link-icon">🔑</span>
                  <span className="mobile-menu__link-label">Administration</span>
                </button>
              )}
            </nav>
            <div className="mobile-menu__footer">
              <p className="mobile-menu__footer-text">🐔 Élevage Avicole Connecté</p>
            </div>
          </div>
        </div>
      </header>

      {!hydrated ? (
        <p className="empty-state">Synchronisation des données…</p>
      ) : (
        <>
          {tab === 'dashboard' && (
            <>
              <ImportantBanner onVoirConseils={() => setTab('conseils')} />
              <LiveTotals lots={lots} now={now} />
              <StatsCards stats={stats} />
              <QuickRecord lots={lots} onDeces={enregistrerDeces} onVente={enregistrerVente} />
              <LotForm onSubmit={ajouterLot} />

              <h2 className="section-title">Mes lots</h2>
              <p className="section-subtitle">
                Phases auto : primaire 15 j → croissance 15 j → finition 15 j → vente à 45 j.
              </p>

              {lotsActifs.length === 0 && lots.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state__icon">📋</div>
                  <p>Aucun lot enregistré. Ajoutez votre premier achat de poussins ci-dessus.</p>
                </div>
              ) : lotsActifs.length === 0 ? (
                <div className="empty-state">
                  <p>Tous les lots sont clôturés. Ajoutez un nouveau lot pour continuer.</p>
                </div>
              ) : (
                <div className="lots-list">
                  {lotsActifs.map((lot) => (
                    <LotCard
                      key={lot.id}
                      lot={lot}
                      onDeces={enregistrerDeces}
                      onVente={enregistrerVente}
                      onDelete={supprimerLot}
                    />
                  ))}
                </div>
              )}

              {lots.length > lotsActifs.length && (
                <>
                  <h2 className="section-title" style={{ marginTop: '2.5rem' }}>
                    Lots archivés
                  </h2>
                  <div className="lots-list">
                    {lots
                      .filter((l) => !lotsActifs.find((a) => a.id === l.id))
                      .map((lot) => (
                        <LotCard
                          key={lot.id}
                          lot={lot}
                          onDeces={enregistrerDeces}
                          onVente={enregistrerVente}
                          onDelete={supprimerLot}
                        />
                      ))}
                  </div>
                </>
              )}
            </>
          )}

          {tab === 'conseils' && <ConseilsView />}
          {tab === 'alertes' && (
            <AlertesPanel
              lots={lots}
              profil={profil}
              now={now}
              completedIds={completedIds}
              marquerFait={marquerFait}
              annulerFait={annulerFait}
              messageLog={messageLog}
              ajouterMessageLog={ajouterMessageLog}
            />
          )}
          {tab === 'alimentation' && <AlimentationPanel lots={lots} now={now} profil={profil} />}
          {tab === 'sante' && <SanteView />}
          {tab === 'parametres' && <ParametresForm profil={profil} onSave={enregistrerProfil} />}
          {tab === 'compte' && <ComptePanel lots={lots} />}
          {tab === 'admin' && <AdminPanel />}
        </>
      )}

      <AppFooter />
    </div>
  );
}
