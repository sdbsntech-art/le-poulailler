import { AUTEUR } from '../data/conseils';

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <p className="app-footer__name">{AUTEUR.nom}</p>
        <p className="app-footer__msg">{AUTEUR.message}</p>
        <a href={`mailto:${AUTEUR.email}`} className="app-footer__mail">
          {AUTEUR.email}
        </a>
      </div>
      <p className="app-footer__copy">Le Poulailler — Gestion d&apos;élevage avicole</p>
    </footer>
  );
}
