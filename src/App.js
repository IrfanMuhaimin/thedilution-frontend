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
import Footer from './components/Footer';
import SecurityOverlay from './components/SecurityOverlay';

// Import global styles
import './Sidebar.css';
import './App.css';
import './styles/main.scss';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  
  // --- STATE FOR THE GLOBAL SECURITY CHECK ---
  // Tracks if the user has passed the face scan in the current session.
  const [isVerified, setIsVerified] = useState(false);
  // Controls the visibility of the full-page security overlay.
  const [showSecurityCheck, setShowSecurityCheck] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // If no user is logged in, render only the login page.
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      {/* 
        The SecurityOverlay is placed here at the top level.
        Because its CSS uses 'position: fixed', it will cover the entire screen
        whenever 'showSecurityCheck' is true, regardless of other components.
      */}
      <SecurityOverlay 
        isVisible={showSecurityCheck} 
        onVerified={() => {
          setIsVerified(true);       // Set verification status to true
          setShowSecurityCheck(false); // Hide the overlay
        }} 
      />

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
              {/* The JobcardsPage route is special. We pass it the verification status
                  and a function to trigger the security check. */}
              <Route 
                path="/jobcards" 
                element={
                  <ProtectedRoute>
                    <JobcardsPage 
                      isVerified={isVerified}
                      initiateSecurityCheck={() => setShowSecurityCheck(true)}
                    />
                  </ProtectedRoute>
                } 
              />
              
              {/* All other routes are standard */}
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
              <Route path="/face-id" element={<ProtectedRoute><FaceIdPage /></ProtectedRoute>} />
              
              {/* Fallback route */}
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