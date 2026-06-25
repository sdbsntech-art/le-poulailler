import {
  AUTEUR,
  REMERCIEMENTS,
  APP_INFO,
  getCopyrightYear,
  getGuidePdfUrl,
} from '../data/footer';

function openGuidePdf() {
  const url = getGuidePdfUrl();
  window.open(url, '_blank', 'noopener,noreferrer');
}

export default function AppFooter() {
  const year = getCopyrightYear();

  return (
    <footer className="app-footer">
      <div className="app-footer__hero">
        <img
          src={`${import.meta.env.BASE_URL}icon.svg`}
          alt=""
          className="app-footer__logo"
          width={88}
          height={88}
        />
        <div>
          <h2 className="app-footer__brand">{APP_INFO.nom}</h2>
          <p className="app-footer__tagline">{APP_INFO.tagline}</p>
        </div>
      </div>

      <div className="app-footer__grid">
        <section className="app-footer__block">
          <h3>{AUTEUR.titre}</h3>
          <p className="app-footer__name">{AUTEUR.nom}</p>
          <ul className="app-footer__profil">
            {AUTEUR.profil.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <a href={`mailto:${AUTEUR.email}`} className="app-footer__mail">
            {AUTEUR.email}
          </a>
        </section>

        <section className="app-footer__block">
          <h3>{REMERCIEMENTS.titre}</h3>
          <p className="app-footer__intro">{REMERCIEMENTS.intro}</p>
          {REMERCIEMENTS.sections.map((s) => (
            <div key={s.titre} className="app-footer__credit">
              <h4>{s.titre}</h4>
              <p>{s.texte}</p>
            </div>
          ))}
        </section>
      </div>

      <div className="app-footer__actions">
        <button type="button" className="app-footer__guide-btn" onClick={openGuidePdf}>
          <span className="app-footer__guide-icon" aria-hidden="true">
            📄
          </span>
          Télécharger le guide utilisateur (PDF)
        </button>
        <p className="app-footer__guide-hint">
          Ouvre le document dans un nouvel onglet — compatible téléphone et ordinateur.
        </p>
      </div>

      <div className="app-footer__bottom">
        <img
          src={`${import.meta.env.BASE_URL}pwa-192x192.png`}
          alt=""
          className="app-footer__logo-sm"
          width={40}
          height={40}
        />
        <p className="app-footer__copy">
          © {year} {AUTEUR.nom} — {APP_INFO.nom}. Tous droits réservés.
        </p>
        <p className="app-footer__copy-sub">
          v{APP_INFO.version} · Dakar, Sénégal
        </p>
      </div>
    </footer>
  );
}
