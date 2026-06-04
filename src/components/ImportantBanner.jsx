import { NOTE_IMPORTANTE } from '../data/conseils';

export default function ImportantBanner({ onVoirConseils }) {
  return (
    <div className="important-banner" role="note">
      <div className="important-banner__icon" aria-hidden="true">
        ‼
      </div>
      <div className="important-banner__content">
        <strong>Note hyper importante</strong>
        <p>
          Consultez les conseils sur la gestion des poussins, la vente en excellentes conditions, l&apos;emplacement
          du poulailler (vent, soleil) et sa construction — avant de démarrer un lot.
        </p>
        <button type="button" className="btn btn-primary btn-sm" onClick={onVoirConseils}>
          Lire tous les conseils
        </button>
      </div>
    </div>
  );
}
