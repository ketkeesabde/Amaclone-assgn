import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-content">
        <h1>🛍️ Amaclone</h1>
        <nav className="nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Shop
          </Link>
          <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`}>
            Cart
          </Link>
          <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
