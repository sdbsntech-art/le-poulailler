import { getAlertesActivesMaintenant } from '../utils/scheduler';

const TYPE_ICONS = {
  aliment: '🌾',
  eau: '💧',
  jalon: '📌',
};

export default function RappelBanner({ alertes, onVoirAlertes, onFait }) {
  const actives = getAlertesActivesMaintenant(alertes);

  if (actives.length === 0) return null;

  const principal = actives[0];

  return (
    <div className="rappel-banner" role="alert" aria-live="assertive">
      <div className="rappel-banner__pulse" aria-hidden="true" />
      <div className="rappel-banner__icon">📬</div>
      <div className="rappel-banner__body">
        <strong className="rappel-banner__title">
          Rappel en cours — {actives.length} tâche{actives.length > 1 ? 's' : ''}
        </strong>
        <p className="rappel-banner__msg">
          {TYPE_ICONS[principal.type]} {principal.titre}
          {principal.repeatIndex != null && (
            <span className="rappel-banner__repeat">
              {' '}
              · Rappel {principal.repeatIndex + 1}/{principal.repeatTotal}
            </span>
          )}
        </p>
        <p className="rappel-banner__detail">{principal.detail}</p>
      </div>
      <div className="rappel-banner__actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => onFait(principal.id)}>
          Fait ✓
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onVoirAlertes}>
          Voir alertes
        </button>
      </div>
    </div>
  );
}
