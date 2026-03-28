import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">⚔️ DnDBags</Link>
      </div>
      <div className="navbar-actions">
        <button
          className="btn-icon"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        {user && (
          <>
            <span className="navbar-email">{user.email}</span>
            <button className="btn btn-outline-sm" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
