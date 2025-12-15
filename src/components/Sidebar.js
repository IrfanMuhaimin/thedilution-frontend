import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, FaUsers, FaCapsules, FaBoxOpen, 
  FaCog, FaBell, FaChartBar, FaClipboardList, FaServer
} from 'react-icons/fa';
import '../Sidebar.css';
import logo1 from '../assets/logo1.png';
import logo2 from '../assets/logo2.png';
import logo3 from '../assets/logo3.png';
import logo4 from '../assets/logo4.png';

function Sidebar({ isOpen }) {
  const location = useLocation(); // Hook to get the current page's path
  const sidebarClass = isOpen ? "sidebar" : "sidebar collapsed";

  const navLinks = [
    { path: "/", icon: <FaTachometerAlt className="me-3" />, text: "Dashboard" },
    { path: "/users", icon: <FaUsers className="me-3" />, text: "User Management" },
    { path: "/hardware", icon: <FaServer className="me-3" />, text: "Hardware" },
    { path: "/inventory", icon: <FaBoxOpen className="me-3" />, text: "Inventory" },
    { path: "/drugs", icon: <FaCapsules className="me-3" />, text: "Drug Management" },
    { path: "/jobcards", icon: <FaClipboardList className="me-3" />, text: "Jobcards" },
    { path: "/wise-paas", icon: <FaCog className="me-3" />, text: "Wise-Paas" },
    { path: "/notifications", icon: <FaBell className="me-3" />, text: "Notification" },
    { path: "/reports", icon: <FaChartBar className="me-3" />, text: "Report" },
  ];

  return (
    <div className={sidebarClass}>
      <Nav className="flex-column p-3">
        {navLinks.map((link) => (
          <Nav.Link 
            key={link.path}
            as={Link} 
            to={link.path} 
            className={location.pathname === link.path ? 'active' : ''}
          >
            {link.icon} {link.text}
          </Nav.Link>
        ))}
      </Nav>
      <div className="sidebar-footer">
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