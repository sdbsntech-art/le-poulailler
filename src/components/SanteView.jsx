import {
  AVERTISSEMENT_SANTE,
  CONSEILS_PROTECTION,
  MESSAGE_VETERINAIRE,
  PHARMACIES_VETERINAIRES,
} from '../data/sante';

export default function SanteView() {
  return (
    <div className="sante-view">
      <h2 className="section-title">Santé & protection du poulailler</h2>
      <p className="section-subtitle">
        Conseils pour limiter les risques infectieux — sans recommandation de médicaments. Orientez-vous vers un
        vétérinaire pour tout traitement.
      </p>

      <div className="sante-notice" role="note">
        <strong>{AVERTISSEMENT_SANTE.titre}</strong>
        <p>{AVERTISSEMENT_SANTE.texte}</p>
      </div>

      {CONSEILS_PROTECTION.map((section) => (
        <section key={section.id} className="sante-section card">
          <header className="sante-section__header">
            <span className="sante-section__icon" aria-hidden="true">
              {section.icone}
            </span>
            <h3>{section.titre}</h3>
          </header>
          {section.points.map((block, idx) => (
            <div key={idx} className="sante-block">
              <h4>{block.titre}</h4>
              <ul>
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}

      <section className="sante-veto card">
        <h3 className="sante-veto__title">{MESSAGE_VETERINAIRE.titre}</h3>
        <p className="sante-veto__intro">{MESSAGE_VETERINAIRE.intro}</p>

        <div className="pharma-grid">
          {PHARMACIES_VETERINAIRES.map((p) => (
            <article key={p.id} className="pharma-card">
              <h4>{p.nom}</h4>
              <p className="pharma-card__quartier">{p.quartier}</p>
              <p className="pharma-card__adresse">{p.adresse}</p>
              <a href={`tel:${p.telephone.replace(/\s/g, '')}`} className="pharma-card__tel">
                {p.telephone}
              </a>
              <a
                href={p.mapsUrl}
                className="btn btn-primary btn-sm pharma-card__maps"
                target="_blank"
                rel="noopener noreferrer"
              >
                📍 {p.mapsLabel}
              </a>
            </article>
          ))}
        </div>

        <p className="sante-veto__footer">
          Les coordonnées sont indicatives. Vérifiez les horaires et disponibilités avant de vous déplacer. D&apos;autres
          cabinets existent dans la région de Dakar — votre vétérinaire habituel reste la meilleure référence.
        </p>
      </section>
    </div>
  );
}
