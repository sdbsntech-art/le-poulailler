import { computeStatsGlobales } from '../utils/phases';
import { formatDateLong } from '../utils/scheduler';

export default function LiveTotals({ lots, now }) {
  const stats = computeStatsGlobales(lots);
  const tauxSurvie =
    stats.vendus + stats.morts + stats.total > 0
      ? Math.round((stats.total / (stats.vendus + stats.morts + stats.total)) * 100)
      : 100;

  return (
    <div className="live-totals card card--highlight">
      <div className="live-totals__header">
        <div>
          <h2 className="section-title" style={{ margin: 0, fontSize: '1.2rem' }}>
            Totaux en direct
          </h2>
          <p className="live-totals__clock">{formatDateLong(now)}</p>
        </div>
        <div className="live-totals__hero">
          <span className="live-totals__hero-value">{stats.total}</span>
          <span className="live-totals__hero-label">poulets vivants</span>
        </div>
      </div>
      <div className="live-totals__grid">
        <div className="live-total-item">
          <span className="live-total-item__val">{stats.morts}</span>
          <span className="live-total-item__lbl">décédés (cumul)</span>
        </div>
        <div className="live-total-item">
          <span className="live-total-item__val live-total-item__val--ok">{stats.vendus}</span>
          <span className="live-total-item__lbl">vendus (cumul)</span>
        </div>
        <div className="live-total-item">
          <span className="live-total-item__val">{stats.primaire}</span>
          <span className="live-total-item__lbl">primaire</span>
        </div>
        <div className="live-total-item">
          <span className="live-total-item__val">{stats.croissance}</span>
          <span className="live-total-item__lbl">croissance</span>
        </div>
        <div className="live-total-item">
          <span className="live-total-item__val">{stats.finition}</span>
          <span className="live-total-item__lbl">finition</span>
        </div>
        <div className="live-total-item">
          <span className="live-total-item__val">{stats.pret}</span>
          <span className="live-total-item__lbl">prêts vente</span>
        </div>
        <div className="live-total-item">
          <span className="live-total-item__val">{tauxSurvie}%</span>
          <span className="live-total-item__lbl">effectif actif</span>
        </div>
        <div className="live-total-item">
          <span className="live-total-item__val">{stats.lotsActifs}</span>
          <span className="live-total-item__lbl">lots actifs</span>
        </div>
      </div>
      <p className="live-totals__hint">
        Mise à jour automatique chaque minute · Phases recalculées selon la date d&apos;achat de chaque lot
      </p>
    </div>
  );
}
