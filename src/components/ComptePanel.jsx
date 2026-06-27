import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAnneesDisponibles, computeRapportMensuel, computeRapportAnnuel, MOIS_LABELS } from '../utils/reports';
import { demanderPermissionNotif } from '../utils/notifyDispatch';

export default function ComptePanel({ lots }) {
  const {
    user,
    isAuthenticated,
    trial,
    login,
    register,
    logout,
    notificationPrefs,
    updateNotificationPrefs,
    syncToCloud,
  } = useAuth();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [section, setSection] = useState('compte');

  const now = new Date();
  const [rapportAnnee, setRapportAnnee] = useState(now.getFullYear());
  const [rapportMois, setRapportMois] = useState(now.getMonth());
  const annees = getAnneesDisponibles(lots);

  const rapportMensuel = computeRapportMensuel(lots, rapportAnnee, rapportMois);
  const rapportAnnuel = computeRapportAnnuel(lots, rapportAnnee);

  async function handleAuth(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (lots.length > 0) {
          await syncToCloud(lots, undefined);
        } else if (result.remoteData?.lots?.length) {
          window.location.reload();
        }
      } else {
        await register(email, password, nom);
        if (lots.length > 0) await syncToCloud(lots, undefined);
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setBusy(false);
    }
  }

  async function toggleEmailAlerts() {
    if (!isAuthenticated) return;
    await updateNotificationPrefs({
      ...notificationPrefs,
      emailAlerts: !notificationPrefs.emailAlerts,
    });
  }

  async function toggleBrowserAlerts() {
    if (!isAuthenticated) return;
    const next = !notificationPrefs.browserAlerts;
    if (next) await demanderPermissionNotif();
    await updateNotificationPrefs({ ...notificationPrefs, browserAlerts: next });
  }

  const tabs = [
    { id: 'compte', label: 'Compte' },
    ...(isAuthenticated || lots.length > 0 ? [{ id: 'rapports', label: 'Rapports' }] : []),
    ...(isAuthenticated ? [{ id: 'notifs', label: 'Notifications' }] : []),
  ];

  return (
    <div className="compte-panel">
      <h2 className="section-title">Mon compte</h2>
      <p className="section-subtitle" style={{ marginTop: 0 }}>
        Essai gratuit {trial.daysLeft} j. — compte optionnel pour sauvegarder, rapports et alertes e-mail.
      </p>

      <nav className="compte-tabs" aria-label="Sections compte">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`compte-tab ${section === t.id ? 'compte-tab--active' : ''}`}
            onClick={() => setSection(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {section === 'compte' && (
        <div className="card compte-card">
          {isAuthenticated ? (
            <div className="compte-connected">
              <p className="compte-connected__badge">✓ Compte actif</p>
              <p>
                <strong>{user.nom || user.email}</strong>
              </p>
              <p className="compte-connected__email">{user.email}</p>
              <p className="compte-hint">Vos lots et paramètres sont synchronisés sur le serveur.</p>
              <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
                Se déconnecter
              </button>
            </div>
          ) : (
            <>
              {!trial.expired && (
                <p className="compte-hint compte-hint--trial">
                  Vous êtes en mode essai. Les données restent sur cet appareil jusqu&apos;à la fin des 7 jours.
                </p>
              )}
              <div className="compte-mode-toggle">
                <button
                  type="button"
                  className={mode === 'login' ? 'compte-mode--active' : ''}
                  onClick={() => setMode('login')}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  className={mode === 'register' ? 'compte-mode--active' : ''}
                  onClick={() => setMode('register')}
                >
                  Créer un compte
                </button>
              </div>
              <form onSubmit={handleAuth} className="compte-form">
                {mode === 'register' && (
                  <div className="form-group">
                    <label>Nom (optionnel)</label>
                    <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Votre nom" />
                  </div>
                )}
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@email.com"
                    autoComplete="email"
                  />
                </div>
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                </div>
                {error && <p className="compte-error">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {section === 'rapports' && (
        <div className="compte-rapports">
          <div className="card">
            <h3 className="compte-rapports__title">Rapport mensuel</h3>
            <div className="compte-filters">
              <select value={rapportMois} onChange={(e) => setRapportMois(Number(e.target.value))}>
                {MOIS_LABELS.map((label, i) => (
                  <option key={label} value={i}>
                    {label}
                  </option>
                ))}
              </select>
              <select value={rapportAnnee} onChange={(e) => setRapportAnnee(Number(e.target.value))}>
                {annees.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="rapport-stats">
              <div className="rapport-stat">
                <strong>{rapportMensuel.poussinsVendus}</strong>
                <span>Poussins vendus</span>
              </div>
              <div className="rapport-stat">
                <strong>{rapportMensuel.poussinsDecedes}</strong>
                <span>Décédés</span>
              </div>
              <div className="rapport-stat">
                <strong>{rapportMensuel.nombreVentes}</strong>
                <span>Opérations vente</span>
              </div>
              <div className="rapport-stat">
                <strong>{rapportMensuel.lotsEnregistres}</strong>
                <span>Lots au total</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h3 className="compte-rapports__title">Rapport annuel {rapportAnnee}</h3>
            <div className="rapport-stats">
              <div className="rapport-stat">
                <strong>{rapportAnnuel.poussinsVendus}</strong>
                <span>Total vendus</span>
              </div>
              <div className="rapport-stat">
                <strong>{rapportAnnuel.poussinsDecedes}</strong>
                <span>Total décédés</span>
              </div>
            </div>
            <div className="rapport-mois-table-wrap">
              <table className="rapport-mois-table">
                <thead>
                  <tr>
                    <th>Mois</th>
                    <th>Vendus</th>
                    <th>Décédés</th>
                  </tr>
                </thead>
                <tbody>
                  {rapportAnnuel.parMois.map((m) => (
                    <tr key={m.mois}>
                      <td>{m.mois}</td>
                      <td>{m.vendus}</td>
                      <td>{m.decedes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!isAuthenticated && (
            <p className="compte-hint" style={{ marginTop: '1rem' }}>
              Connectez-vous pour conserver ces rapports après la fin de l&apos;essai gratuit.
            </p>
          )}
        </div>
      )}

      {section === 'notifs' && isAuthenticated && (
        <div className="card compte-card">
          <h3 className="compte-rapports__title">Alertes & notifications</h3>
          <p className="compte-hint">Disponible avec un compte actif.</p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={notificationPrefs.browserAlerts}
              onChange={toggleBrowserAlerts}
            />
            Notifications dans le navigateur (repas, eau, jalons)
          </label>
          <label className="check-label">
            <input type="checkbox" checked={notificationPrefs.emailAlerts} onChange={toggleEmailAlerts} />
            Alertes par e-mail (bientôt activé sur le serveur)
          </label>
          <p className="compte-hint">
            Les rappels sur le site (bannière + son) restent actifs via l&apos;onglet Paramètres.
          </p>
        </div>
      )}
    </div>
  );
}
