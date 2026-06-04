import { NOTE_IMPORTANTE, SECTIONS_CONSEILS } from '../data/conseils';

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
        </section>
      ))}
    </div>
  );
}
