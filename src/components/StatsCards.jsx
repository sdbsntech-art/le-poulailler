const cards = [
  { key: 'total', label: 'Poulets vivants', accent: 'var(--gold)' },
  { key: 'primaire', label: 'Phase primaire', accent: 'var(--phase-primaire)' },
  { key: 'croissance', label: 'En croissance', accent: 'var(--phase-croissance)' },
  { key: 'finition', label: 'En finition', accent: 'var(--phase-finition)' },
  { key: 'pret', label: 'Prêts à vendre', accent: 'var(--phase-pret)' },
  { key: 'vendus', label: 'Total vendus', accent: 'var(--success)' },
  { key: 'morts', label: 'Total décédés', accent: 'var(--danger)' },
];

export default function StatsCards({ stats }) {
  return (
    <div className="stats-grid">
      {cards.map(({ key, label, accent }) => (
        <div key={key} className="stat-card" style={{ '--accent': accent }}>
          <div className="stat-card__value">{stats[key] ?? 0}</div>
          <div className="stat-card__label">{label}</div>
        </div>
      ))}
      <div className="stat-card" style={{ '--accent': 'var(--cream-muted)' }}>
        <div className="stat-card__value">{stats.lotsActifs}</div>
        <div className="stat-card__label">Lots actifs</div>
      </div>
    </div>
  );
}
