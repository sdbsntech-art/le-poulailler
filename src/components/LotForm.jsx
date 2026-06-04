import { useState } from 'react';

export default function LotForm({ onSubmit }) {
  const [dateAchat, setDateAchat] = useState(new Date().toISOString().slice(0, 10));
  const [quantite, setQuantite] = useState('');
  const [libelle, setLibelle] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const q = parseInt(quantite, 10);
    if (!dateAchat || !q || q < 1) return;
    onSubmit({ dateAchat, quantiteInitiale: q, libelle });
    setQuantite('');
    setLibelle('');
  }

  return (
    <div className="card card--highlight">
      <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Nouveau lot de poussins
      </h2>
      <p className="section-subtitle" style={{ marginTop: 0 }}>
        La phase est calculée automatiquement : J+15 croissance, J+30 finition, J+45 vente.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Date d&apos;achat exacte</label>
            <input
              type="date"
              value={dateAchat}
              onChange={(e) => setDateAchat(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Nombre de poussins</label>
            <input
              type="number"
              min="1"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              placeholder="Ex. 500"
              required
            />
          </div>
          <div className="form-group">
            <label>Nom du lot (optionnel)</label>
            <input
              type="text"
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              placeholder="Ex. Lot mars 2026"
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              Enregistrer le lot
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
