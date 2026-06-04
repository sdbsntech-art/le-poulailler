import { PHASES, MEDICAMENTS_PAR_PHASE } from '../data/medicaments';

const PHASE_COLORS = {
  primaire: 'var(--phase-primaire)',
  croissance: 'var(--phase-croissance)',
  finition: 'var(--phase-finition)',
  pret: 'var(--phase-pret)',
};

const ORDER = ['primaire', 'croissance', 'finition', 'pret'];

export default function MedicamentsView() {
  return (
    <div>
      <h2 className="section-title">Base médicaments par phase</h2>
      <p className="section-subtitle">
        Protocole sanitaire complet — à adapter avec votre vétérinaire selon votre zone et réglementation.
      </p>

      <div className="alert">
        Rappel automatique des cycles : <strong>J0–14</strong> primaire → <strong>J15–29</strong> croissance →{' '}
        <strong>J30–44</strong> finition → <strong>J45+</strong> prêt à la vente (délais d&apos;attente obligatoires).
      </div>

      {ORDER.map((phaseId) => {
        const phase = PHASES[phaseId];
        const meds = MEDICAMENTS_PAR_PHASE[phaseId] || [];
        return (
          <section key={phaseId} className="med-phase-block">
            <header className="med-phase-header">
              <span
                className="phase-badge"
                style={{ '--phase-color': PHASE_COLORS[phaseId] }}
              >
                {phase.shortLabel}
              </span>
              <div>
                <h3>{phase.label}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--cream-muted)', fontWeight: 300 }}>
                  {phase.jourMax !== null
                    ? `Jours ${phase.jourMin} à ${phase.jourMax}`
                    : `À partir du jour ${phase.jourMin}`}
                  {' — '}
                  {phase.description}
                </p>
              </div>
            </header>

            <div className="med-grid">
              {meds.map((med, idx) => (
                <article key={idx} className="med-card">
                  <h4>{med.nom}</h4>
                  <p className="med-row">
                    <strong>Dosage :</strong> {med.dosage}
                  </p>
                  <p className="med-row">
                    <strong>Fréquence :</strong> {med.frequence}
                  </p>
                  <p className="med-row">
                    <strong>Objectif :</strong> {med.objectif}
                  </p>
                  <p className="med-row" style={{ color: 'var(--gold-muted)' }}>
                    <strong>Précaution :</strong> {med.precaution}
                  </p>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
