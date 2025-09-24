import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa"; // Import the home icon
import "./sidebar.css";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        <FaHome size={28} />  {/* Home Icon */}
      </button>

      {/* Sidebar */}
      <nav className={`sidebar ${isOpen ? "open" : ""}`}>
        <ul>
          <li><Link to="/meetings" onClick={() => setIsOpen(false)}>Meetings</Link></li>
          <li><Link to="/notifications" onClick={() => setIsOpen(false)}>Notifications</Link></li>
        </ul>
      </nav>
    </>
  );
}

export default Sidebar;