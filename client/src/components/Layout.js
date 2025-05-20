import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

function Layout() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
        <Link className="navbar-brand" to="/dashboard">Lost & Found</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user?.role === 'user' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/submit-claim">Submit Claim</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-claims">My Claims</Link>
                </li>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">Admin Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/items">All Items</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/claims">All Claims</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/admin/users">Manage Users</Link>
                </li>
              </>
            )}
          </ul>

          {user && (
            <div className="d-flex align-items-center gap-3">
              <span className="me-3 text-muted">{user.fullName}</span>
              <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </nav>

      <main className="container mt-4">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;




