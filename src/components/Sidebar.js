import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaTachometerAlt, FaUsers, FaCapsules, FaBoxOpen, 
  FaCog, FaBell, FaChartBar, FaClipboardList, FaServer,
  FaUserShield, FaFlask
} from 'react-icons/fa';
import '../Sidebar.css';
import logo1 from '../assets/logo1.png';
import logo2 from '../assets/logo2.png';
import logo3 from '../assets/logo3.png';
import logo4 from '../assets/logo4.png';

function Sidebar({ isOpen }) {
  const location = useLocation();
  const { user } = useAuth();
  const sidebarClass = isOpen ? "sidebar" : "sidebar collapsed";

  const navLinks = [
    { path: "/", icon: <FaTachometerAlt />, text: "Dashboard", roles: ['Admin', 'Pharmacist', 'Doctor'], section: 'main' },
    { path: "/users", icon: <FaUsers />, text: "User Management", roles: ['Admin'], section: 'management' },
    { path: "/face-id", icon: <FaUserShield />, text: "Face ID Management", roles: ['Admin'], section: 'management' },
    { path: "/hardware", icon: <FaServer />, text: "Hardware", roles: ['Admin', 'Pharmacist'], section: 'system' },
    { path: "/inventory", icon: <FaBoxOpen />, text: "Inventory", roles: ['Admin', 'Pharmacist'], section: 'operations' },
    { path: "/drugs", icon: <FaCapsules />, text: "Drug Management", roles: ['Admin', 'Pharmacist', 'Doctor'], section: 'operations' },
    { path: "/jobcards", icon: <FaClipboardList />, text: "Jobcards", roles: ['Admin', 'Pharmacist', 'Doctor'], section: 'operations' },
    { path: "/wise-paas", icon: <FaCog />, text: "Wise-Paas", roles: ['Admin', 'Pharmacist'], section: 'system' },
    { path: "/notifications", icon: <FaBell />, text: "Notifications", roles: ['Admin', 'Pharmacist', 'Doctor'], section: 'system' },
    { path: "/reports", icon: <FaChartBar />, text: "Reports", roles: ['Admin', 'Pharmacist'], section: 'analytics' },
  ];

  // Filter links by user role
  const filteredLinks = navLinks.filter(link => link.roles.includes(user.role));

  return (
    <div className={sidebarClass}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-content">
          <div className="sidebar-brand-icon">
            <FaFlask />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">TheDilution</span>
            <span className="sidebar-brand-tagline">Pharmacy System</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Nav className="flex-column">
        {filteredLinks.map((link) => (
          <Nav.Link 
            key={link.path}
            as={Link} 
            to={link.path} 
            className={location.pathname === link.path ? 'active' : ''}
          >
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-text">{link.text}</span>
          </Nav.Link>
        ))}
      </Nav>

      {/* Footer with logos */}
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