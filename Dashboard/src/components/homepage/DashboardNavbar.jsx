import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DashboardNavbar.css'; // External CSS for styling

const DashboardSidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // State to track drawer visibility

  // Function to toggle the drawer visibility
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // Function to close the sidebar if clicking outside of it
  const handleClickOutside = (event) => {
    if (isOpen && !event.target.closest('.dashboard-sidebar') && !event.target.closest('.hamburger-icon')) {
      setIsOpen(false); // Close sidebar if clicked outside
    }
  };

  // Add event listener when component is mounted
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside); // Clean up event listener
    };
  }, [isOpen]);

  return (
    <div>
      {/* Sidebar Drawer */}
      <div className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo-dash" style={{ color: 'white' }}>
  <h2>Ease My Construction</h2>
</div>
        <ul className="sidebar-list">
          <li className="sidebar-item">
            <Link to="/home" className="sidebar-link">
              <i className="fas fa-home"></i> Home
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/login" className="sidebar-link">
              <i className="fas fa-sign-in-alt"></i> Login
            </Link>
          </li>
        </ul>
      </div>

      {/* Hamburger Icon */}
      <button className="hamburger-icon" onClick={toggleDrawer}>
        ☰
      </button>
    </div>
  );
};

export default DashboardSidebar;