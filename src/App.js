import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FaBars, FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useAuth } from './context/AuthContext';

// Import all page components
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import HardwarePage from './pages/HardwarePage';
import JobcardsPage from './pages/JobcardsPage';
import DrugManagementPage from './pages/DrugManagementPage';
import InventoryPage from './pages/InventoryPage';
import WisePaasPage from './pages/WisePaasPage';
import NotificationPage from './pages/NotificationPage';
import ReportPage from './pages/ReportPage';
import ConsumptionPage from './pages/ConsumptionPage';
import ProfilePage from './pages/ProfilePage';
import FaceIdPage from './pages/FaceIdPage';

// Import layout and security components
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Footer from './components/Footer';

// Import global styles
import './Sidebar.css';
import './App.css';
import './styles/main.scss';
import './styles/GlobalPages.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Get user initials for avatar
  const getUserInitials = (username) => {
    if (!username) return 'U';
    return username
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} />
      
      <div className="content-wrapper" style={{ marginLeft: isSidebarOpen ? '280px' : '0' }}>
        <Navbar expand="lg" className="app-navbar position-sticky top-0" style={{ zIndex: 9998 }}>
          <Container fluid>
            {/* Toggle Button */}
            <button className="btn-toggle" onClick={toggleSidebar}>
              <FaBars />
            </button>
            
            {/* Brand */}
            <Navbar.Brand as={Link} to="/">
              TheDilution
            </Navbar.Brand>
            
            {/* User Section */}
            <Nav className="ms-auto">
              <NavDropdown 
                title={
                  <div className="user-info">
                    <div className="user-avatar">
                      {getUserInitials(user.username)}
                    </div>
                    <div className="user-details">
                      <span className="user-name">{user.username}</span>
                      <span className="user-role">{user.role}</span>
                    </div>
                    <FaChevronDown style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginLeft: '0.25rem' }} />
                  </div>
                } 
                id="user-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  <span className="dropdown-item-icon"><FaUser /></span>
                  My Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout} className="logout-item">
                  <span className="dropdown-item-icon"><FaSignOutAlt /></span>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Container>
        </Navbar>
        
        <main className="main-content-area">
          <Container fluid className="p-3">
            <Routes>
              {/* The JobcardsPage route is now a standard route again */}
              <Route path="/jobcards" element={<ProtectedRoute><JobcardsPage /></ProtectedRoute>} />
              
              <Route 
                path="/face-id" 
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <FaceIdPage />
                    </AdminRoute>
                  </ProtectedRoute>
                } 
              />
              
              {/* All other routes */}
              <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/drugs" element={<ProtectedRoute><DrugManagementPage /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
              <Route path="/hardware" element={<ProtectedRoute><HardwarePage /></ProtectedRoute>} />
              <Route path="/wise-paas" element={<ProtectedRoute><WisePaasPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
              <Route path="/consumptions" element={<ProtectedRoute><ConsumptionPage /></ProtectedRoute>} />
              <Route path="*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            </Routes>
          </Container>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default App;