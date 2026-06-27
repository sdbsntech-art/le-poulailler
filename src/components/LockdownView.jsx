import { useEffect } from 'react';

export default function LockdownView() {
  useEffect(() => {
    // Disable right click even on the lockdown screen
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div
      className="lockdown-screen"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0a09',
        color: '#f5f0e6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
        textAlign: 'center'
      }}
    >
      <div
        className="lockdown-card"
        style={{
          maxWidth: '500px',
          background: '#151310',
          border: '2px solid #c45c5c',
          borderRadius: '12px',
          padding: '2.5rem',
          boxShadow: '0 0 50px rgba(196, 92, 92, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}
      >
        <div
          className="lockdown-icon"
          style={{
            fontSize: '4.5rem',
            lineHeight: 1,
            color: '#c45c5c',
            animation: 'pulse 2s infinite alternate'
          }}
        >
          🚨
        </div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#c45c5c',
            letterSpacing: '0.05em',
            margin: 0,
            textTransform: 'uppercase'
          }}
        >
          Accès Bloqué — Sécurité Haute Intensité
        </h1>
        
        <div
          style={{
            height: '2px',
            width: '100%',
            background: 'linear-gradient(90deg, transparent, #c45c5c, transparent)'
          }}
        />

        <p style={{ fontSize: '0.95rem', color: 'rgba(245, 240, 230, 0.8)', margin: 0, lineHeight: '1.6' }}>
          Ce navigateur ou votre adresse IP a été restreint de manière permanente suite à la détection d&apos;activités suspectes (tentatives d&apos;ouverture des outils d&apos;inspection F12 ou trop de tentatives de connexion échouées).
        </p>

        <p style={{ fontSize: '0.85rem', color: 'rgba(245, 240, 230, 0.5)', margin: 0 }}>
          Code protocole : <code style={{ color: '#e8c97a', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>ZAYEL-SEC-2026</code>
        </p>

        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(196, 92, 92, 0.1)',
            border: '1px solid rgba(196, 92, 92, 0.3)',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#c45c5c',
            fontWeight: '500'
          }}
        >
          Veuillez contacter l&apos;administrateur pour débloquer votre accès.
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
