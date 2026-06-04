import { useState } from 'react';
import { demanderPermissionNotif } from '../utils/notifyDispatch';

export default function ParametresForm({ profil, onSave }) {
  const [horairesRepas, setHorairesRepas] = useState(
    profil.horairesRepas?.join(', ') || '07:00, 12:00, 17:00'
  );
  const [notifyNavigateur, setNotifyNavigateur] = useState(profil.notifyNavigateur !== false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = horairesRepas
      .split(',')
      .map((h) => h.trim())
      .filter((h) => /^\d{1,2}:\d{2}$/.test(h));
    if (parsed.length !== 3) {
      alert('Indiquez exactement 3 horaires de repas (ex: 07:00, 12:00, 17:00)');
      return;
    }
    onSave({ horairesRepas: parsed, notifyNavigateur });
    if (notifyNavigateur) {
      const p = await demanderPermissionNotif();
      setStatus(
        p === 'granted'
          ? 'Rappels sur cet appareil activés (notifications locales).'
          : p === 'denied'
            ? 'Notifications refusées — activez-les dans les paramètres du navigateur.'
            : 'Notifications non supportées sur cet appareil.'
      );
    } else {
      setStatus('');
    }
    setSaved(true);
  }

  return (
    <div className="card">
      <h2 className="section-title" style={{ fontSize: '1.2rem' }}>
        Paramètres des rappels
      </h2>
      <p className="section-subtitle" style={{ marginTop: 0 }}>
        Horaires des 3 repas quotidiens et alertes sur votre téléphone ou ordinateur (sans SMS ni e-mail).
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>3 repas / jour (horaires)</label>
          <input value={horairesRepas} onChange={(e) => setHorairesRepas(e.target.value)} />
        </div>
        <label className="check-label">
          <input
            type="checkbox"
            checked={notifyNavigateur}
            onChange={(e) => setNotifyNavigateur(e.target.checked)}
          />
          Activer les notifications sur cet appareil
        </label>
        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Enregistrer
        </button>
        {saved && <span className="profil-form__ok"> Enregistré.</span>}
        {status && <p className="profil-form__note">{status}</p>}
      </form>
    </div>
  );
}
