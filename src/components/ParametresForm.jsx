import { useState } from 'react';
import { REPAS_LABELS, HORAIRES_EAU_DEFAUT, RAPPEL_DEFAUT, formatPlageRappel } from '../utils/rappels';

function toInputTime(hhmm) {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return '07:00';
  const [h, m] = hhmm.split(':');
  return `${String(h).padStart(2, '0')}:${m}`;
}

function fromInputTime(val) {
  const [h, m] = val.split(':');
  return `${String(parseInt(h, 10)).padStart(2, '0')}:${m}`;
}

function HoraireLigne({ label, heure, onChange, onRemove, showRemove }) {
  const [editing, setEditing] = useState(false);

  function valider(nouvelleHeure) {
    onChange(nouvelleHeure);
    setEditing(false);
  }

  return (
    <div className="horaire-ligne">
      <span className="horaire-ligne__label">{label}</span>
      {!editing ? (
        <>
          <span className="horaire-ligne__heure">{heure}</span>
          <button type="button" className="btn btn-primary btn-sm horaire-ligne__btn" onClick={() => setEditing(true)}>
            Modifier
          </button>
          {showRemove && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onRemove}>
              Retirer
            </button>
          )}
        </>
      ) : (
        <div className="horaire-ligne__edit">
          <input
            type="time"
            className="horaire-ligne__picker"
            value={toInputTime(heure)}
            onChange={(e) => valider(fromInputTime(e.target.value))}
            aria-label={`Choisir l'heure pour ${label}`}
          />
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}

function ReglageRappel({ label, value, min, max, step, onChange, suffix }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="horaire-ligne">
      <span className="horaire-ligne__label">{label}</span>
      {!editing ? (
        <>
          <span className="horaire-ligne__heure">
            {value} {suffix}
          </span>
          <button type="button" className="btn btn-primary btn-sm horaire-ligne__btn" onClick={() => setEditing(true)}>
            Modifier
          </button>
        </>
      ) : (
        <div className="horaire-ligne__stepper">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onChange(Math.max(min, value - step))}
            aria-label="Diminuer"
          >
            −
          </button>
          <span className="horaire-ligne__heure">
            {value} {suffix}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onChange(Math.min(max, value + step))}
            aria-label="Augmenter"
          >
            +
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing(false)}>
            OK
          </button>
        </div>
      )}
    </div>
  );
}

export default function ParametresForm({ profil, onSave }) {
  const [repas, setRepas] = useState(
    profil.horairesRepas?.length === 3
      ? profil.horairesRepas.map(toInputTime)
      : ['07:00', '12:00', '17:00']
  );
  const [eau, setEau] = useState(
    profil.horairesEau?.length > 0 ? profil.horairesEau.map(toInputTime) : [...HORAIRES_EAU_DEFAUT]
  );
  const [intervalMin, setIntervalMin] = useState(profil.rappelIntervalMinutes ?? RAPPEL_DEFAUT.intervalMinutes);
  const [repetitions, setRepetitions] = useState(profil.rappelRepetitions ?? RAPPEL_DEFAUT.repetitions);
  const [sonRappel, setSonRappel] = useState(profil.sonRappel !== false);
  const [saved, setSaved] = useState(false);

  function updateRepas(i, val) {
    setRepas((prev) => prev.map((h, idx) => (idx === i ? val : h)));
  }

  function updateEau(i, val) {
    setEau((prev) => prev.map((h, idx) => (idx === i ? val : h)));
  }

  function ajouterEau() {
    setEau((prev) => [...prev, '12:00']);
  }

  function supprimerEau(i) {
    setEau((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const horairesRepas = repas.map(fromInputTime);
    const horairesEau = [...eau].map(fromInputTime).sort((a, b) => a.localeCompare(b));

    onSave({
      horairesRepas,
      horairesEau,
      rappelIntervalMinutes: intervalMin,
      rappelRepetitions: repetitions,
      sonRappel,
      notifyNavigateur: false,
      rappelsConfigures: true,
    });

    setSaved(true);
  }

  const interval = intervalMin;
  const reps = repetitions;

  return (
    <div className="card parametres-rappels">
      <h2 className="section-title" style={{ fontSize: '1.2rem' }}>
        Horaires & rappels automatiques
      </h2>
      <p className="section-subtitle" style={{ marginTop: 0 }}>
        Choisissez vos horaires avec le bouton <strong>Modifier</strong>. Les rappels s&apos;affichent sur le site
        (onglet Alertes + bannière + son) — automatiques, sans saisie manuelle.
      </p>

      {!profil.rappelsConfigures && (
        <div className="parametres-rappels__warn" role="alert">
          Appuyez sur Modifier pour chaque horaire, puis enregistrez pour activer les rappels.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset className="parametres-fieldset">
          <legend>🌾 3 repas par jour</legend>
          {REPAS_LABELS.map((label, i) => (
            <div key={label}>
              <HoraireLigne label={label} heure={repas[i]} onChange={(v) => updateRepas(i, v)} />
              <p className="parametres-hint parametres-hint--inline">
                Rappels : {formatPlageRappel(repas[i], interval, reps)}
              </p>
            </div>
          ))}
        </fieldset>

        <fieldset className="parametres-fieldset">
          <legend>💧 Horaires eau / abreuvoirs</legend>
          <p className="parametres-fieldset__intro">
            Un horaire par contrôle d&apos;eau. Utilisez Modifier pour ajuster chaque créneau.
          </p>
          {eau.map((h, i) => (
            <HoraireLigne
              key={`eau-${i}-${h}`}
              label={`Contrôle ${i + 1}`}
              heure={h}
              onChange={(v) => updateEau(i, v)}
              onRemove={() => supprimerEau(i)}
              showRemove={eau.length > 1}
            />
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={ajouterEau}>
            + Ajouter un horaire eau
          </button>
        </fieldset>

        <fieldset className="parametres-fieldset">
          <legend>🔔 Répétition des rappels sur le site</legend>
          <ReglageRappel
            label="Intervalle"
            value={intervalMin}
            min={5}
            max={30}
            step={5}
            suffix="min"
            onChange={setIntervalMin}
          />
          <ReglageRappel
            label="Nombre de rappels"
            value={repetitions}
            min={2}
            max={8}
            step={1}
            suffix="fois"
            onChange={setRepetitions}
          />
          <p className="parametres-hint">
            Exemple repas 07:00 → rappels à 07:00, 07:10, 07:20, 07:30 (10 min × 4).
          </p>
        </fieldset>

        <div className="parametres-checks">
          <label className="check-label">
            <input type="checkbox" checked={sonRappel} onChange={(e) => setSonRappel(e.target.checked)} />
            Son de rappel sur le site (double bip)
          </label>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Enregistrer mes horaires
        </button>
        {saved && (
          <span className="profil-form__ok"> Enregistré — rappels actifs sur le site.</span>
        )}
      </form>
    </div>
  );
}
