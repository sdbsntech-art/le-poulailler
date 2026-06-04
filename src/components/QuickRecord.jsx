import { useState } from 'react';
import { getEffectifLot } from '../utils/phases';

export default function QuickRecord({ lots, onDeces, onVente }) {
  const actifs = lots.filter((l) => getEffectifLot(l) > 0);
  const [lotId, setLotId] = useState(actifs[0]?.id || '');
  const [type, setType] = useState('deces');
  const [quantite, setQuantite] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  const lot = actifs.find((l) => l.id === lotId);
  const effectif = lot ? getEffectifLot(lot) : 0;

  function handleSubmit(e) {
    e.preventDefault();
    const q = parseInt(quantite, 10);
    if (!lotId || !q || q < 1 || q > effectif) {
      setMessage('Quantité invalide ou lot non sélectionné.');
      return;
    }
    const payload = {
      date: new Date().toISOString().slice(0, 10),
      quantite: q,
      note,
    };
    if (type === 'deces') onDeces(lotId, payload);
    else onVente(lotId, payload);
    setQuantite('');
    setNote('');
    setMessage(
      type === 'deces'
        ? `${q} décès enregistré(s). Total vivants mis à jour.`
        : `${q} vente(s) enregistrée(s).`
    );
    setTimeout(() => setMessage(''), 4000);
  }

  if (actifs.length === 0) return null;

  return (
    <div className="card quick-record">
      <h2 className="section-title" style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>
        Enregistrement rapide
      </h2>
      <p className="section-subtitle" style={{ marginTop: 0 }}>
        Déclarez décès ou ventes — le total vivant se recalcule immédiatement.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Lot</label>
            <select value={lotId} onChange={(e) => setLotId(e.target.value)}>
              {actifs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.libelle || l.dateAchat} — {getEffectifLot(l)} vivants
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="deces">Poulets décédés</option>
              <option value="vente">Poulets vendus</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quantité (max {effectif})</label>
            <input
              type="number"
              min="1"
              max={effectif}
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Note</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optionnel" />
          </div>
          <div className="form-group">
            <button type="submit" className={`btn ${type === 'deces' ? 'btn-danger' : 'btn-primary'}`}>
              Enregistrer
            </button>
          </div>
        </div>
      </form>
      {message && <p className="quick-record__msg">{message}</p>}
    </div>
  );
}
