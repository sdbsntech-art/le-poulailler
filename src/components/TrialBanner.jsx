import { useAuth } from '../context/AuthContext';

export default function TrialBanner({ onOpenCompte }) {
  const { isAuthenticated, trial, trialDays } = useAuth();

  if (isAuthenticated) return null;

  if (trial.expired) {
    return (
      <div className="trial-banner trial-banner--expired" role="status">
        <p>
          <strong>Période d&apos;essai terminée.</strong> L&apos;application reste utilisable. Créez un compte pour
          sauvegarder vos lots sur le cloud, recevoir vos rapports et vos alertes par e-mail.
        </p>
        <button type="button" className="btn btn-primary btn-sm" onClick={onOpenCompte}>
          Créer un compte
        </button>
      </div>
    );
  }

  if (trial.showWarning) {
    return (
      <div className="trial-banner trial-banner--warn" role="status">
        <p>
          <strong>Essai gratuit : {trial.daysLeft} jour{trial.daysLeft > 1 ? 's' : ''} restant{trial.daysLeft > 1 ? 's' : ''}</strong>
          {' '}sur {trialDays}. Un compte permet de sauvegarder vos données sur le cloud.
        </p>
        <button type="button" className="btn btn-primary btn-sm" onClick={onOpenCompte}>
          Créer un compte
        </button>
      </div>
    );
  }

  return (
    <div className="trial-banner trial-banner--info">
      <p>
        Mode essai ({trial.daysLeft} j. restants) —{' '}
        <button type="button" className="trial-banner__link" onClick={onOpenCompte}>
          connectez-vous
        </button>{' '}
        pour sauvegarder vos données sur le cloud.
      </p>
    </div>
  );
}
