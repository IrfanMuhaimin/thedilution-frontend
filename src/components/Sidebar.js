import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, FaUsers, FaCapsules, FaBoxOpen, 
  FaCog, FaBell, FaChartBar, FaClipboardList, FaServer
} from 'react-icons/fa';
import '../Sidebar.css';

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
    </div>
  );
}

export default Sidebar;