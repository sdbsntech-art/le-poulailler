import { useState, useEffect } from 'react';
import {
  apiAdminLogin,
  apiGetAdminStats,
  apiAdminChangePassword,
  tryLocalAdminLogin,
} from '../utils/api';

export default function AdminPanel() {
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('admin_token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (adminToken) {
      loadStats();
    }
  }, [adminToken]);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGetAdminStats(adminToken);
      setStats(data);
    } catch (err) {
      setError(err.message || 'Impossible de charger les statistiques.');
      if (err.message?.includes('expirée') || err.message?.includes('authentifié')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { token } = await apiAdminLogin(username, password);
      sessionStorage.setItem('admin_token', token);
      setAdminToken(token);
      setUsername('');
      setPassword('');
    } catch (err) {
      const local = tryLocalAdminLogin(username, password);
      if (local) {
        sessionStorage.setItem('admin_token', local.token);
        setAdminToken(local.token);
        setUsername('');
        setPassword('');
        return;
      }
      setError(err.message || 'Identifiants invalides.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setAdminToken('');
    setStats(null);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setChangingPass(true);
    try {
      await apiAdminChangePassword(adminToken, newPassword);
      setSuccess('Le mot de passe de l\'administrateur a été modifié.');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Erreur lors de la modification.');
    } finally {
      setChangingPass(false);
    }
  };

  if (!adminToken) {
    return (
      <div className="admin-login card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <h2 className="admin-login__title" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-light)', marginBottom: '1rem', textAlign: 'center' }}>
          Console Admin
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--cream-muted)', textAlign: 'center', marginBottom: '1rem' }}>
          Identifiant : <code>zayelprotocole2026</code> — mot de passe : valeur <code>ADMIN_KEY</code> du fichier .env
        </p>
        {error && <div className="alert alert--danger" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="admin-user" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--cream-muted)', marginBottom: '0.25rem' }}>Identifiant</label>
            <input
              id="admin-user"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-control"
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '6px',
                background: 'var(--bg-deep)',
                border: '1px solid var(--border)',
                color: '#fff'
              }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="admin-pass" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--cream-muted)', marginBottom: '0.25rem' }}>Mot de passe</label>
            <input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '6px',
                background: 'var(--bg-deep)',
                border: '1px solid var(--border)',
                color: '#fff'
              }}
            />
          </div>
          <button
            type="submit"
            className="btn-submit"
            style={{
              padding: '0.75rem',
              background: 'linear-gradient(135deg, var(--gold-light), var(--gold))',
              color: 'var(--bg-deep)',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            S&apos;authentifier
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-light)', margin: 0 }}>
            Administration — Le Poulailler
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--cream-muted)', margin: 0 }}>
            Statistiques et gestion des utilisateurs
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(196, 92, 92, 0.1)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(196, 92, 92, 0.2)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(196, 92, 92, 0.1)'}
        >
          Déconnexion
        </button>
      </header>

      {stats?.offline && (
        <div className="alert" style={{ border: '1px solid var(--gold)', color: 'var(--gold-light)', background: 'rgba(212, 175, 95, 0.08)' }}>
          Mode hors ligne — connectez le serveur API pour voir la liste des utilisateurs et les statistiques.
        </div>
      )}

      {error && <div className="alert" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', background: 'rgba(196, 92, 92, 0.05)' }}>{error}</div>}
      {success && <div className="alert" style={{ border: '1px solid var(--success)', color: 'var(--success)', background: 'rgba(90, 158, 122, 0.05)' }}>{success}</div>}

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ textAlign: 'center', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '2rem' }}>👥</span>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--gold-light)', margin: '0.5rem 0 0' }}>{stats.totalUsers}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--cream-muted)', textTransform: 'uppercase' }}>Utilisateurs inscrits</p>
          </div>
          <div className="card" style={{ textAlign: 'center', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '2rem' }}>👁️</span>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--gold-light)', margin: '0.5rem 0 0' }}>{stats.pageViews}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--cream-muted)', textTransform: 'uppercase' }}>Pages consultées</p>
          </div>
          <div className="card" style={{ textAlign: 'center', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '2rem' }}>🌐</span>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--gold-light)', margin: '0.5rem 0 0' }}>{stats.uniqueVisitors}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--cream-muted)', textTransform: 'uppercase' }}>Visiteurs uniques</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '12px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-light)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            Liste des éleveurs inscrits
          </h3>
          {loading && <p style={{ color: 'var(--cream-muted)' }}>Chargement...</p>}
          {!loading && stats?.users && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--gold)' }}>
                    <th style={{ padding: '0.5rem' }}>Nom</th>
                    <th style={{ padding: '0.5rem' }}>Email</th>
                    <th style={{ padding: '0.5rem' }}>Lots</th>
                    <th style={{ padding: '0.5rem' }}>Dernière Connexion</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.5rem', color: '#fff', fontWeight: '500' }}>{u.nom || 'Sans nom'}</td>
                      <td style={{ padding: '0.5rem', color: 'var(--cream-muted)' }}>{u.email}</td>
                      <td style={{ padding: '0.5rem', color: 'var(--gold-light)' }}>{u.lots_count}</td>
                      <td style={{ padding: '0.5rem', color: 'var(--cream-muted)' }}>
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : 'Jamais'}
                      </td>
                    </tr>
                  ))}
                  {stats.users.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--cream-muted)' }}>
                        {stats.offline ? 'Serveur non connecté.' : 'Aucun utilisateur enregistré.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!stats?.offline && (
          <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-light)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Modifier le mot de passe Admin
            </h3>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-group">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  required
                  className="form-control"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    background: 'var(--bg-deep)',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={changingPass}
                style={{
                  padding: '0.5rem',
                  background: 'linear-gradient(135deg, var(--gold-light), var(--gold))',
                  color: 'var(--bg-deep)',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {changingPass ? 'Modification...' : 'Sauvegarder'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
