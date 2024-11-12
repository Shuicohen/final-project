import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">AI Travel Planner</Link>
        <nav className="nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/plan" className={`nav-link ${location.pathname === '/plan' ? 'active' : ''}`}>Plan Trip</Link>
          {user ? (
            <>
              <Link to="/saved-trips" className={`nav-link ${location.pathname === '/saved-trips' ? 'active' : ''}`}>Saved Trips</Link>
              <button onClick={logout} className="nav-link button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>Login</Link>
              <Link to="/register" className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
