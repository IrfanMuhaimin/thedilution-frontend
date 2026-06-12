import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaTachometerAlt, FaUsers, FaCapsules, FaBoxOpen, 
  FaCog, FaChartBar, FaClipboardList, FaServer,
  FaUserShield, FaFlask, FaTimes
} from 'react-icons/fa';
import '../Sidebar.css';
import logo1 from '../assets/logo1.png';
import logo2 from '../assets/logo2.png';
import logo3 from '../assets/logo3.png';
import logo4 from '../assets/logo4.png';

// NEW: Accept 'toggleSidebar' as a prop from App.js
function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const { user } = useAuth();
  const sidebarClass = isOpen ? "sidebar" : "sidebar collapsed";

  const navLinks = [
    { path: "/", icon: <FaTachometerAlt />, text: "Dashboard", roles: ['Admin', 'Pharmacist', 'Doctor'] },
    { path: "/users", icon: <FaUsers />, text: "User Management", roles: ['Admin'] },
    { path: "/face-id", icon: <FaUserShield />, text: "Face ID Management", roles: ['Admin'] },
    { path: "/hardware", icon: <FaServer />, text: "Hardware", roles: ['Admin'] },
    { path: "/inventory", icon: <FaBoxOpen />, text: "Inventory", roles: ['Admin', 'Pharmacist'] },
    { path: "/drugs", icon: <FaCapsules />, text: "Drug Management", roles: ['Pharmacist'] },
    { path: "/jobcards", icon: <FaClipboardList />, text: "Jobcards", roles: ['Pharmacist', 'Doctor'] },
    { path: "/wise-paas", icon: <FaCog />, text: "Wise-Paas", roles: ['Admin'] },
    { path: "/reports", icon: <FaChartBar />, text: "Reports", roles: ['Admin', 'Pharmacist'] },
  ];

  const filteredLinks = navLinks.filter(link => link.roles.includes(user.role));

  // Helper to auto-close the drawer on mobile after clicking a link
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      toggleSidebar(); // Close drawer
    }
  };

  return (
    <div className={sidebarClass}>
      <div className="sidebar-brand d-flex align-items-center justify-content-between">
        <div className="sidebar-brand-content">
          <div className="sidebar-brand-icon"><FaFlask /></div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">TheDilution</span>
            <span className="sidebar-brand-tagline">Pharmacy System</span>
          </div>
        </div>
        
        {/* NEW: Close button visible ONLY on mobile */}
        <button className="btn-close-sidebar d-md-none" onClick={toggleSidebar} title="Close Menu">
            <FaTimes />
        </button>
      </div>

      <Nav className="flex-column">
        {filteredLinks.map((link) => (
          <Nav.Link 
            key={link.path}
            as={Link} 
            to={link.path} 
            className={location.pathname === link.path ? 'active' : ''}
            onClick={handleLinkClick} // NEW: Auto close on mobile
          >
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-text">{link.text}</span>
          </Nav.Link>
        ))}
      </Nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-divider"></div>
        <div className="logo-row">
          <img src={logo1} alt="Logo 1" className="sidebar-logo1" />
          <img src={logo3} alt="Logo 3" className="sidebar-logo2" />
        </div>
        <div className="logo-row">
          <img src={logo2} alt="Logo 2" className="sidebar-logo3" />
          <img src={logo4} alt="Logo 4" className="sidebar-logo4" />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;