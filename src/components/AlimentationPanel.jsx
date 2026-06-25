import { getAgeJours, getEffectifLot, getPhaseFromAge } from '../utils/phases';
import { calculerBesoinsJournaliers } from '../data/alimentation';
import { PHASES } from '../data/phases';

export default function AlimentationPanel({ lots, now, profil }) {
  const actifs = lots.filter((l) => getEffectifLot(l) > 0);
  const nbEau = profil?.horairesEau?.length || 6;

  if (actifs.length === 0) {
    return (
      <div className="empty-state card">
        <p>Aucun lot actif — les besoins alimentation/eau s&apos;afficheront après enregistrement d&apos;un lot.</p>
      </div>
    );
  }

  let totalKg = 0;
  let totalEau = 0;

  return (
    <div className="alim-panel">
      <p className="section-subtitle" style={{ marginTop: 0 }}>
        Calcul intelligent : {profil?.horairesRepas?.length || 3} repas/jour · {nbEau} contrôles eau (horaires dans
        Paramètres).
      </p>
      <div className="alim-grid">
        {actifs.map((lot) => {
          const age = getAgeJours(lot.dateAchat, now);
          const effectif = getEffectifLot(lot);
          const phase = getPhaseFromAge(age);
          const besoins = calculerBesoinsJournaliers(effectif, age);
          totalKg += besoins.alimentKg;
          totalEau += besoins.eauLitres;

          return (
            <article key={lot.id} className="alim-card card">
              <header className="alim-card__head">
                <h4>{lot.libelle || `Lot J${age}`}</h4>
                <span className="phase-badge" style={{ '--phase-color': `var(--phase-${phase})` }}>
                  {PHASES[phase].shortLabel}
                </span>
              </header>
              <p className="alim-card__meta">
                {effectif} sujets · Jour {age} · {nbEau} horaires eau/jour
              </p>
              <div className="alim-card__stats">
                <div>
                  <strong>{besoins.alimentKg} kg</strong>
                  <span>aliment / jour</span>
                </div>
                <div>
                  <strong>{besoins.parRepasKg} kg</strong>
                  <span>par repas (×3)</span>
                </div>
                <div>
                  <strong>{besoins.eauLitres} L</strong>
                  <span>eau / jour</span>
                </div>
                <div>
                  <strong>{besoins.litresParControle} L</strong>
                  <span>par contrôle eau</span>
                </div>
              </div>
              <p className="alim-card__hint">
                ~{besoins.grammesParPoulet} g/poulet/jour · ratio eau optimisé pour la phase
              </p>
            </article>
          );
        })}
      </div>
      {actifs.length > 1 && (
        <div className="card alim-total">
          <strong>Total exploitation aujourd&apos;hui :</strong> {Math.round(totalKg * 100) / 100} kg aliment ·{' '}
          {Math.round(totalEau * 100) / 100} L eau
        </div>
      )}
    </div>
  );
}
