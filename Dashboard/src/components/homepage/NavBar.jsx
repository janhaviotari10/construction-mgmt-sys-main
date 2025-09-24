import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./Navbar.css"; // For custom styles

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/"> {/* Use Link for navigation */}
          Ease My Construction
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" to="/"> {/* Home link */}
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/gallery"> {/* Gallery link */}
                Gallery
              </Link>
            </li>
            
            {/* Login Button */}
            <li className="nav-item">
              <Link className="nav-link login-btn" to="/login"> {/* Login link */}
                Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;