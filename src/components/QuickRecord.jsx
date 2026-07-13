import { useState } from 'react';
import { getEffectifLot } from '../utils/phases';

export default function QuickRecord({ lots, onDeces, onVente }) {
  const actifs = lots.filter((l) => getEffectifLot(l) > 0);
  const [lotId, setLotId] = useState(actifs[0]?.id || '');
  const [type, setType] = useState('deces');
  const [quantite, setQuantite] = useState('');
  const [note, setNote] = useState('');
  const [sellPriceMode, setSellPriceMode] = useState('unit');
  const [priceVal, setPriceVal] = useState('');
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
    let pu = 0;
    if (type === 'vente') {
      const pVal = Number(priceVal) || 0;
      pu = sellPriceMode === 'unit' ? pVal : (q > 0 ? pVal / q : 0);
    }
    const payload = {
      date: new Date().toISOString().slice(0, 10),
      quantite: q,
      prixUnitaire: pu,
      note,
    };
    if (type === 'deces') onDeces(lotId, payload);
    else onVente(lotId, payload);
    setQuantite('');
    setNote('');
    setPriceVal('');
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
        <div className="form-grid" style={{ gridTemplateColumns: type === 'vente' ? 'repeat(auto-fit, minmax(140px, 1fr))' : undefined }}>
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
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPriceVal('');
              }}
            >
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
          {type === 'vente' && (
            <>
              <div className="form-group">
                <label>Mode prix</label>
                <select value={sellPriceMode} onChange={(e) => setSellPriceMode(e.target.value)}>
                  <option value="unit">Prix unitaire</option>
                  <option value="total">Montant total</option>
                </select>
              </div>
              <div className="form-group">
                <label>{sellPriceMode === 'unit' ? 'Prix unitaire (FCFA)' : 'Montant total (FCFA)'}</label>
                <input
                  type="number"
                  min="0"
                  placeholder={sellPriceMode === 'unit' ? 'Ex: 3000' : 'Ex: 150000'}
                  value={priceVal}
                  onChange={(e) => setPriceVal(e.target.value)}
                  required
                />
              </div>
            </>
          )}
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
      {type === 'vente' && quantite && priceVal && (
        <p style={{ fontSize: '0.75rem', color: 'var(--gold-light)', marginTop: '0.5rem' }}>
          {sellPriceMode === 'unit'
            ? `Montant total calculé : ${(Number(quantite) * Number(priceVal)).toLocaleString()} FCFA`
            : `Prix unitaire calculé : ${Math.round(Number(priceVal) / Number(quantite)).toLocaleString()} FCFA / poulet`}
        </p>
      )}
      {message && <p className="quick-record__msg" style={{ marginTop: '0.75rem' }}>{message}</p>}
    </div>
  );
}
