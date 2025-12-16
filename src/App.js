import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { FaBars, FaUserCircle } from 'react-icons/fa';
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
// We no longer import SecurityOverlay here

// Import global styles
import './Sidebar.css';
import './App.css';
import './styles/main.scss';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
      
      <div className="content-wrapper" style={{ marginLeft: isSidebarOpen ? '250px' : '0' }}>
        <Navbar expand="lg" className="app-navbar position-sticky top-0" style={{ zIndex: 1021 }}>
          <Container fluid>
            <Button variant="outline-light" onClick={toggleSidebar}><FaBars /></Button>
            <Navbar.Brand as={Link} to="/" className="ms-3" style={{ fontWeight: 'bold' }}>
              TheDilution
            </Navbar.Brand>
            <Nav className="ms-auto">
              <NavDropdown 
                title={<span><FaUserCircle className="me-2" />Welcome, {user.username}</span>} 
                id="user-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">My Profile</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
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