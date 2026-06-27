import { useState } from 'react';
import { NOTE_IMPORTANTE, SECTIONS_CONSEILS, VIDEO_CONSTRUCTION } from '../data/conseils';

function ConstructionVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const v = VIDEO_CONSTRUCTION;

  return (
    <div className="conseils-video">
      <h4 className="conseils-video__title">{v.titre}</h4>
      <p className="conseils-video__desc">{v.description}</p>
      <p className="conseils-video__chaine">
        Chaîne YouTube :{' '}
        <a href={v.chaineUrl} target="_blank" rel="noopener noreferrer">
          {v.chaineNom}
        </a>{' '}
        —{' '}
        <a href={v.watchUrl} target="_blank" rel="noopener noreferrer" className="conseils-video__watch-link">
          Regarder sur YouTube ↗
        </a>
      </p>

      <div className="conseils-video__container">
        {!isPlaying ? (
          <button
            onClick={() => setIsPlaying(true)}
            className="conseils-video__preview-btn"
            aria-label={`Lire la vidéo de construction — ${v.chaineNom}`}
          >
            <img
              src={v.thumbnail}
              alt={`Aperçu vidéo construction poulailler — ${v.chaineNom}`}
              className="conseils-video__thumb"
              loading="lazy"
            />
            <span className="conseils-video__play-overlay" aria-hidden="true">
              <span className="conseils-video__play-icon">▶</span>
            </span>
          </button>
        ) : (
          <div className="conseils-video__player-wrapper">
            <iframe
              src={`${v.embedUrl}?autoplay=1`}
              title={`${v.titre} — ${v.chaineNom}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConseilsView() {
  return (
    <div className="conseils-view">
      <div className="note-critique card">
        <span className="note-critique__badge">Très important</span>
        <h2 className="note-critique__titre">{NOTE_IMPORTANTE.titre}</h2>
        <p className="note-critique__intro">{NOTE_IMPORTANTE.intro}</p>
      </div>

      {SECTIONS_CONSEILS.map((section) => (
        <section
          key={section.id}
          className={`conseils-section card ${section.important ? 'conseils-section--important' : ''}`}
        >
          <header className="conseils-section__head">
            <span className="conseils-section__icone" aria-hidden="true">
              {section.icone}
            </span>
            <h3>{section.titre}</h3>
            {section.important && <span className="conseils-section__tag">Essentiel</span>}
          </header>

          {section.points.map((bloc, idx) => (
            <div key={idx} className="conseils-bloc">
              <h4>{bloc.titre}</h4>
              <ul>
                {bloc.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {section.id === 'construction' && <ConstructionVideo />}
        </section>
      ))}
    </div>
  );
}
