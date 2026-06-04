import { buildToutesAlertes, enrichirStatutAlertes, getAlertesUrgentes } from '../utils/scheduler';
import { dispatcherRappel } from '../utils/notifyDispatch';

const TYPE_LABELS = {
  medicament: 'Médicament',
  aliment: 'Alimentation',
  eau: 'Eau',
  jalon: 'Jalon',
};

const TYPE_ICONS = {
  medicament: '💊',
  aliment: '🌾',
  eau: '💧',
  jalon: '📌',
};

export default function AlertesPanel({
  lots,
  profil,
  now,
  completedIds,
  marquerFait,
  annulerFait,
  ajouterMessageLog,
  messageLog,
}) {
  const brutes = buildToutesAlertes(lots, { horairesRepas: profil.horairesRepas, now });
  const alertes = enrichirStatutAlertes(brutes, completedIds, now);
  const urgentes = getAlertesUrgentes(alertes);
  const aVenir = alertes.filter((a) => a.statut === 'a-venir');
  const enRetard = alertes.filter((a) => a.statut === 'en-retard');
  const faits = alertes.filter((a) => a.done);

  function handleNotifier(a) {
    dispatcherRappel(a, profil, ajouterMessageLog);
  }

  return (
    <div className="alertes-panel">
      {urgentes.length > 0 && (
        <div className="alertes-urgent card">
          <h3 className="alertes-urgent__title">⚠ À faire maintenant ({urgentes.length})</h3>
          <ul className="alertes-list">
            {urgentes.map((a) => (
              <AlerteRow
                key={a.id}
                alerte={a}
                onFait={() => marquerFait(a.id)}
                onNotifier={() => handleNotifier(a)}
              />
            ))}
          </ul>
        </div>
      )}

      {enRetard.length > 0 && (
        <div className="alertes-retard card">
          <h3 className="alertes-retard__title">En retard ({enRetard.length})</h3>
          <ul className="alertes-list">
            {enRetard.map((a) => (
              <AlerteRow
                key={a.id}
                alerte={a}
                onFait={() => marquerFait(a.id)}
                onNotifier={() => handleNotifier(a)}
              />
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h3 className="section-title" style={{ fontSize: '1.1rem' }}>
          Programme du jour
        </h3>
        <p className="section-subtitle" style={{ marginTop: 0 }}>
          {alertes.length} tâches · {faits.length} terminées · 3 repas + contrôles eau automatiques
        </p>

        {aVenir.length === 0 && urgentes.length === 0 && enRetard.length === 0 && faits.length > 0 && (
          <p className="empty-state" style={{ padding: '1.5rem' }}>
            Toutes les tâches du jour sont faites. Bravo !
          </p>
        )}

        <ul className="alertes-list">
          {aVenir.map((a) => (
            <AlerteRow
              key={a.id}
              alerte={a}
              onFait={() => marquerFait(a.id)}
              onNotifier={() => handleNotifier(a)}
            />
          ))}
        </ul>

        {faits.length > 0 && (
          <>
            <h4 style={{ marginTop: '1.5rem', fontSize: '0.95rem', color: 'var(--cream-muted)' }}>
              Terminé aujourd&apos;hui
            </h4>
            <ul className="alertes-list alertes-list--done">
              {faits.map((a) => (
                <li key={a.id} className="alerte-row alerte-row--done">
                  <span>
                    {TYPE_ICONS[a.type]} {a.heure} — {a.titre}
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => annulerFait(a.id)}>
                    Annuler
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {messageLog.length > 0 && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Journal des notifications</h4>
          <ul className="history-list">
            {messageLog.slice(0, 8).map((m) => (
              <li key={m.id}>
                {new Date(m.at).toLocaleString('fr-FR')} — {m.titre} → {m.canaux}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AlerteRow({ alerte, onFait, onNotifier }) {
  return (
    <li className={`alerte-row alerte-row--${alerte.statut}`}>
      <div className="alerte-row__main">
        <span className="alerte-row__time">{alerte.heure}</span>
        <span className="alerte-row__type">{TYPE_LABELS[alerte.type]}</span>
        <strong>{alerte.titre}</strong>
        <p className="alerte-row__detail">{alerte.detail}</p>
        <span className="alerte-row__lot">{alerte.lotLibelle}</span>
      </div>
      <div className="alerte-row__actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onNotifier} title="Notification sur cet appareil">
          Notifier
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={onFait}>
          Fait ✓
        </button>
      </div>
    </li>
  );
}
