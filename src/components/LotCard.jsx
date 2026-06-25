import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PHASES, JALONS } from '../data/phases';
import {
  getAgeJours,
  getPhaseInfo,
  getProchainJalon,
  getJoursRestantsPhase,
  getDateJalon,
  getEffectifLot,
} from '../utils/phases';
import Modal from './Modal';

const PHASE_COLORS = {
  primaire: 'var(--phase-primaire)',
  croissance: 'var(--phase-croissance)',
  finition: 'var(--phase-finition)',
  pret: 'var(--phase-pret)',
};

export default function LotCard({ lot, onDeces, onVente, onDelete }) {
  const [modal, setModal] = useState(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formQty, setFormQty] = useState('');
  const [formNote, setFormNote] = useState('');

  const age = getAgeJours(lot.dateAchat);
  const phase = getPhaseInfo(age);
  const effectif = getEffectifLot(lot);
  const jalon = getProchainJalon(age);
  const joursRestants = getJoursRestantsPhase(age);

  const decesTotal = (lot.deces || []).reduce((s, d) => s + d.quantite, 0);
  const ventesTotal = (lot.ventes || []).reduce((s, v) => s + v.quantite, 0);

  function openModal(type) {
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormQty('');
    setFormNote('');
    setModal(type);
  }

  function submitModal() {
    const q = parseInt(formQty, 10);
    if (!q || q < 1 || q > effectif) return;
    const payload = { date: formDate, quantite: q, note: formNote };
    if (modal === 'deces') onDeces(lot.id, payload);
    if (modal === 'vente') onVente(lot.id, payload);
    setModal(null);
  }

  const dateLabel = format(parseISO(lot.dateAchat), 'dd MMMM yyyy', { locale: fr });

  return (
    <article className="lot-card">
      <header className="lot-card__header">
        <div>
          <h3 className="lot-card__title">
            {lot.libelle || `Lot du ${dateLabel}`}
          </h3>
          <p className="lot-card__meta">
            Acheté le {dateLabel} · {lot.quantiteInitiale} poussins · Jour {age}
          </p>
        </div>
        <span
          className="phase-badge"
          style={{ '--phase-color': PHASE_COLORS[phase.id] }}
        >
          {phase.shortLabel}
        </span>
      </header>

      <div className="lot-card__body">
        <div>
          <div className="lot-stats-row">
            <div className="lot-stat">
              <strong>{effectif}</strong>
              Vivants
            </div>
            <div className="lot-stat lot-stat--success">
              <strong>{ventesTotal}</strong>
              Vendus
            </div>
            <div className="lot-stat lot-stat--danger">
              <strong>{decesTotal}</strong>
              Décédés
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--cream-muted)', marginTop: '1rem' }}>
            {phase.description}
          </p>

          {joursRestants !== null && (
            <div className="jalon-info">
              {joursRestants} jour{joursRestants > 1 ? 's' : ''} restant{joursRestants > 1 ? 's' : ''} dans cette phase
              {jalon && (
                <> — Prochain jalon : <strong>{jalon.label}</strong> dans {jalon.reste} j (le {getDateJalon(lot.dateAchat, jalon.jour)})</>
              )}
            </div>
          )}

          {phase.id === 'pret' && (
            <div className="jalon-info" style={{ borderColor: 'var(--phase-pret)' }}>
              Cycle de 45 jours atteint — lot prêt pour la commercialisation.
            </div>
          )}

          <div className="lot-timeline">
            {JALONS.map((j) => {
              const done = age >= j.jour;
              const current = getPhaseInfo(age).id === j.phase && (j.jour === 0 || age >= j.jour);
              const isCurrentPhase = PHASES[j.phase]?.id === phase.id;
              return (
                <div
                  key={j.jour}
                  className={`timeline-step ${done ? 'timeline-step--done' : ''} ${isCurrentPhase ? 'timeline-step--current' : ''}`}
                  style={isCurrentPhase ? { '--phase-color': PHASE_COLORS[phase.id] } : {}}
                  title={getDateJalon(lot.dateAchat, j.jour)}
                >
                  J{j.jour}
                  <br />
                  <span style={{ opacity: 0.8 }}>{j.label.split(' ').slice(-1)[0]}</span>
                </div>
              );
            })}
          </div>

          {effectif > 0 && (
            <div className="lot-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openModal('deces')}>
                Déclarer des décès
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal('vente')}>
                Enregistrer une vente
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(lot.id)}>
                Supprimer le lot
              </button>
            </div>
          )}
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.75rem', color: 'var(--gold-light)' }}>
            Protection — {phase.label}
          </h4>
          <ul style={{ fontSize: '0.8rem', color: 'var(--cream-muted)', listStyle: 'none' }}>
            {phase.id === 'primaire' && (
              <>
                <li style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                  Chauffage stable, litière sèche, eau propre renouvelée souvent.
                </li>
                <li style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                  Retirer tout sujet isolé ou malade — consulter un vétérinaire si pic de décès.
                </li>
              </>
            )}
            {phase.id === 'croissance' && (
              <>
                <li style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                  Augmenter l&apos;espace, aérer sans courant d&apos;air sur les sujets.
                </li>
                <li style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                  Contrôler toux ou diarrhée — traitement uniquement sur avis vétérinaire.
                </li>
              </>
            )}
            {(phase.id === 'finition' || phase.id === 'pret') && (
              <>
                <li style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                  Litière sèche, ammoniac bas, inspection avant vente.
                </li>
                <li style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                  Respecter les délais d&apos;attente indiqués par votre vétérinaire.
                </li>
              </>
            )}
          </ul>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--gold-muted)' }}>
            Voir l&apos;onglet « Santé & protection » pour les conseils complets et les pharmacies vétérinaires à
            Dakar.
          </p>

          {(lot.deces?.length > 0 || lot.ventes?.length > 0) && (
            <>
              <h4 style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Historique</h4>
              <ul className="history-list">
                {(lot.ventes || []).map((v) => (
                  <li key={v.id}>
                    Vente : {v.quantite} le {v.date} {v.note && `— ${v.note}`}
                  </li>
                ))}
                {(lot.deces || []).map((d) => (
                  <li key={d.id}>
                    Décès : {d.quantite} le {d.date} {d.note && `— ${d.note}`}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {modal && (
        <Modal
          title={modal === 'deces' ? 'Déclarer des décès' : 'Enregistrer une vente'}
          onClose={() => setModal(null)}
          onConfirm={submitModal}
          confirmLabel="Enregistrer"
        >
          <p style={{ fontSize: '0.85rem', color: 'var(--cream-muted)', marginBottom: '1rem' }}>
            Effectif disponible : <strong>{effectif}</strong>
          </p>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label>Date</label>
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label>Quantité</label>
            <input
              type="number"
              min="1"
              max={effectif}
              value={formQty}
              onChange={(e) => setFormQty(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Note (optionnel)</label>
            <input type="text" value={formNote} onChange={(e) => setFormNote(e.target.value)} />
          </div>
        </Modal>
      )}
    </article>
  );
}
