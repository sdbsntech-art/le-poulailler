import { useState } from 'react';
import { usePoulailler } from './hooks/usePoulailler';
import { useProfil } from './hooks/useProfil';
import { useAlertes } from './hooks/useAlertes';
import { useLiveClock } from './hooks/useLiveClock';
import { useNotificationEngine } from './hooks/useNotificationEngine';
import { computeStatsGlobales, getEffectifLot } from './utils/phases';
import { buildToutesAlertes, enrichirStatutAlertes, getAlertesUrgentes } from './utils/scheduler';
import StatsCards from './components/StatsCards';
import LotForm from './components/LotForm';
import LotCard from './components/LotCard';
import MedicamentsView from './components/MedicamentsView';
import PwaInstall from './components/PwaInstall';
import LiveTotals from './components/LiveTotals';
import QuickRecord from './components/QuickRecord';
import ParametresForm from './components/ParametresForm';
import AlertesPanel from './components/AlertesPanel';
import AlimentationPanel from './components/AlimentationPanel';
import ConseilsView from './components/ConseilsView';
import ImportantBanner from './components/ImportantBanner';
import AppFooter from './components/AppFooter';
import './App.css';

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'conseils', label: 'Conseils essentiels' },
  { id: 'alertes', label: 'Alertes & suivi' },
  { id: 'alimentation', label: 'Alimentation & eau' },
  { id: 'medicaments', label: 'Médicaments' },
  { id: 'parametres', label: 'Paramètres' },
];

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const now = useLiveClock(30000);
  const { lots, ajouterLot, supprimerLot, enregistrerDeces, enregistrerVente } = usePoulailler();
  const { profil, enregistrerProfil } = useProfil();
  const { completedIds, marquerFait, annulerFait, messageLog, ajouterMessageLog } = useAlertes();

  useNotificationEngine(lots, profil, {
    completedIds,
    ajouterMessageLog,
    enabled: profil.notifyNavigateur,
  });

  const stats = computeStatsGlobales(lots);
  const nbUrgentes = getAlertesUrgentes(
    enrichirStatutAlertes(
      buildToutesAlertes(lots, { horairesRepas: profil.horairesRepas, now }),
      completedIds,
      now
    )
  ).length;

  const lotsActifs = lots.filter((l) => getEffectifLot(l) > 0);

  return (
    <div className="app">
      <PwaInstall />
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
        <nav className="nav-tabs" aria-label="Navigation principale">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`nav-tab ${tab === t.id ? 'nav-tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.id === 'alertes' && nbUrgentes > 0 && (
                <span className="nav-tab__badge">{nbUrgentes}</span>
              )}
            </button>
          ))}
        </nav>
      </header>

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

      {tab === 'alimentation' && <AlimentationPanel lots={lots} now={now} />}

      {tab === 'medicaments' && <MedicamentsView />}

      {tab === 'parametres' && <ParametresForm profil={profil} onSave={enregistrerProfil} />}

      <AppFooter />
    </div>
  );
}
