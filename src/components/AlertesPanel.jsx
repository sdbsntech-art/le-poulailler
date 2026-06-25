import {
  buildToutesAlertes,
  enrichirStatutAlertes,
  getAlertesUrgentes,
  getAlertesActivesMaintenant,
} from '../utils/scheduler';
import { jouerSonRappel } from '../utils/alertSound';
import { formatPlageRappel } from '../utils/rappels';

const TYPE_LABELS = {
  aliment: 'Alimentation',
  eau: 'Eau',
  jalon: 'Jalon',
};

const TYPE_ICONS = {
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
  const brutes = buildToutesAlertes(lots, {
    horairesRepas: profil.horairesRepas,
    horairesEau: profil.horairesEau,
    now,
  });
  const alertes = enrichirStatutAlertes(brutes, completedIds, now, profil);
  const actives = getAlertesActivesMaintenant(alertes);
  const urgentes = getAlertesUrgentes(alertes);
  const aVenir = alertes.filter((a) => a.statut === 'a-venir');
  const enRetard = alertes.filter((a) => a.statut === 'en-retard');
  const faits = alertes.filter((a) => a.done);

  const nbRepas = profil.horairesRepas?.length || 3;
  const nbEau = profil.horairesEau?.length || 0;

  function handleNotifier(a) {
    if (profil.sonRappel) jouerSonRappel();
    ajouterMessageLog({
      alerteId: a.id,
      titre: a.titre,
      heure: a.slotHeure || a.heure,
      canaux: profil.sonRappel ? 'site+son' : 'site',
      repeatLabel: a.repeatIndex != null ? `Rappel ${a.repeatIndex + 1}/${a.repeatTotal}` : null,
    });
  }

  if (!profil.rappelsConfigures) {
    return (
      <div className="card alertes-setup">
        <div className="alertes-setup__icon">⏰</div>
        <h3 className="section-title">Configurez vos rappels</h3>
        <p className="section-subtitle">
          Les alertes automatiques utilisent <strong>vos horaires</strong> de repas et d&apos;eau. Allez dans
          Paramètres, choisissez vos heures (matin, après-midi, soir + contrôles eau), puis enregistrez.
        </p>
      </div>
    );
  }

  return (
    <div className="alertes-panel">
      {actives.length > 0 && (
        <div className="alertes-messages card">
          <h3 className="alertes-messages__title">
            <span className="alertes-messages__bell" aria-hidden="true">
              📬
            </span>
            Messages actifs ({actives.length})
          </h3>
          <ul className="alertes-messages__list">
            {actives.map((a) => (
              <li key={`msg-${a.id}-${a.repeatIndex}`} className="alertes-message-item">
                <span className="alertes-message-item__icon">{TYPE_ICONS[a.type]}</span>
                <div>
                  <strong>{a.titre}</strong>
                  {a.repeatIndex != null && (
                    <span className="alertes-message-item__repeat">
                      Rappel {a.repeatIndex + 1}/{a.repeatTotal} · {a.slotHeure}
                    </span>
                  )}
                  <p>{a.detail}</p>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => marquerFait(a.id)}>
                  Fait ✓
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {urgentes.length > 0 && actives.length === 0 && (
        <div className="alertes-urgent card">
          <h3 className="alertes-urgent__title">⚠ En retard ({urgentes.length})</h3>
          <ul className="alertes-list">
            {urgentes.map((a) => (
              <AlerteRow
                key={a.id}
                alerte={a}
                profil={profil}
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
                profil={profil}
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
          {alertes.length} tâches · {faits.length} terminées · {nbRepas} repas + {nbEau} contrôles eau · rappel
          toutes les {profil.rappelIntervalMinutes ?? 10} min × {profil.rappelRepetitions ?? 4}
        </p>

        {aVenir.length === 0 && urgentes.length === 0 && faits.length > 0 && (
          <p className="empty-state" style={{ padding: '1.5rem' }}>
            Toutes les tâches du jour sont faites. Bravo !
          </p>
        )}

        <ul className="alertes-list">
          {aVenir.map((a) => (
            <AlerteRow
              key={a.id}
              alerte={a}
              profil={profil}
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
        <div className="card alertes-journal">
          <h4 className="alertes-journal__title">
            <span aria-hidden="true">📬</span> Journal des rappels
          </h4>
          <ul className="history-list">
            {messageLog.slice(0, 12).map((m) => (
              <li key={m.id}>
                <span className="alertes-journal__time">{new Date(m.at).toLocaleTimeString('fr-FR')}</span>
                {m.repeatLabel && <span className="alertes-journal__repeat">{m.repeatLabel}</span>}
                {m.titre} → {m.canaux}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AlerteRow({ alerte, profil, onFait, onNotifier }) {
  const interval = profil.rappelIntervalMinutes ?? 10;
  const reps = profil.rappelRepetitions ?? 4;
  const isLive = alerte.statut === 'maintenant';

  return (
    <li className={`alerte-row alerte-row--${alerte.statut} ${isLive ? 'alerte-row--live' : ''}`}>
      <div className="alerte-row__main">
        <div className="alerte-row__head">
          {isLive && <span className="alerte-row__msg-icon" aria-hidden="true">📬</span>}
          <span className="alerte-row__time">{alerte.heure}</span>
          <span className="alerte-row__type">
            {TYPE_ICONS[alerte.type]} {TYPE_LABELS[alerte.type]}
          </span>
          {alerte.repasLabel && <span className="alerte-row__repas">{alerte.repasLabel}</span>}
        </div>
        <strong>{alerte.titre}</strong>
        {isLive && alerte.repeatIndex != null && (
          <p className="alerte-row__repeat-live">
            Rappel {alerte.repeatIndex + 1} sur {alerte.repeatTotal} · maintenant {alerte.slotHeure}
          </p>
        )}
        <p className="alerte-row__detail">{alerte.detail}</p>
        <span className="alerte-row__plage">
          Rappels auto : {formatPlageRappel(alerte.heure, interval, reps)}
        </span>
        <span className="alerte-row__lot">{alerte.lotLibelle}</span>
      </div>
      <div className="alerte-row__actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onNotifier} title="Relancer son + message">
          📬 Rappeler
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={onFait}>
          Fait ✓
        </button>
      </div>
    </li>
  );
}
