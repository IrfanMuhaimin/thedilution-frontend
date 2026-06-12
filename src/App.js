import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar, Container, NavDropdown } from 'react-bootstrap';
import { FaBars, FaUser, FaSignOutAlt, FaChevronDown, FaBell, FaCommentDots } from 'react-icons/fa';

// Contexts
import { useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { ChatProvider, useChat } from './context/ChatContext'; // NEW CHAT CONTEXT

// Pages
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
import CompleteProfilePage from './pages/CompleteProfilePage';
import ChatPage from './pages/ChatPage'; // NEW CHAT PAGE

// Archive Pages
import ArchivedUsersPage from './pages/ArchivedUsersPage';
import ArchivedHardwarePage from './pages/ArchivedHardwarePage';
import ArchivedInventoryPage from './pages/ArchivedInventoryPage';
import ArchivedDrugsPage from './pages/ArchivedDrugsPage';
import ArchivedJobcardsPage from './pages/ArchivedJobcardsPage';
import ArchivedReportsPage from './pages/ArchivedReportsPage';

// Layout & Security
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Footer from './components/Footer';
import InactiveAccountOverlay from './components/InactiveAccountOverlay';

// Styles
import './Sidebar.css';
import './App.css';
import './styles/main.scss';
import './styles/GlobalPages.css';

/**
 * AppContent contains the actual UI logic.
 */
function AppContent() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications(); 
  const { unreadChatTotal } = useChat(); // NEW: Unread message count
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const getUserInitials = (username) => {
    if (!username) return 'U';
    return username.charAt(0).toUpperCase();
  };

  const renderAvatar = () => {
    if (user?.profilePicture) {
      return <img src={user.profilePicture} alt="User" className="navbar-avatar-img" />;
    }
    return <div className="user-avatar-fallback">{getUserInitials(user?.username)}</div>;
  };

  // --- SECURITY HIERARCHY ---

  if (!user) {
    return <Routes><Route path="*" element={<LoginPage />} /></Routes>;
  }

  if (user.status === 'inactive') {
    return <InactiveAccountOverlay />;
  }

  const isCompleteProfilePath = location.pathname === '/complete-profile' || user.isFirstLogin;

  return (
    <div className="app-layout">
      {/* 1. Passed toggleSidebar as a prop */}
      {!isCompleteProfilePath && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
      
      {/* 2. NEW: Semi-transparent backdrop for mobile overlay */}
      {!isCompleteProfilePath && isSidebarOpen && (
          <div className="sidebar-mobile-backdrop d-md-none" onClick={toggleSidebar}></div>
      )}
      
      <div 
        className="content-wrapper" 
        style={{ 
          marginLeft: (isSidebarOpen && !isCompleteProfilePath) ? '280px' : '0' 
        }}
      >
        <Navbar expand="lg" className="app-navbar position-sticky top-0">
          <Container fluid className="px-3">
            
            {/* LEFT SIDE: TOGGLE & BRAND */}
            <div className="d-flex align-items-center">
              {!isCompleteProfilePath && (
                <button className="btn-toggle-custom me-3" onClick={toggleSidebar}>
                  <FaBars />
                </button>
              )}
              <Navbar.Brand as={Link} to={user.isFirstLogin ? "#" : "/"} className="navbar-brand-premium">
                <span className="brand-dot"></span> TheDilution
              </Navbar.Brand>
            </div>

            {/* RIGHT SIDE: ACTIONS GROUP */}
            <div className="header-actions-group">
              
              {/* NEW: CHAT ICON */}
              {!user.isFirstLogin && (
                <Link to="/chat" className="notification-anchor me-2">
                  <div className="notif-icon-circle">
                    <FaCommentDots />
                  </div>
                  {unreadChatTotal > 0 && (
                    <span className="notif-badge-pill">{unreadChatTotal}</span>
                  )}
                </Link>
              )}

              {/* SYSTEM NOTIFICATION BELL */}
              {!user.isFirstLogin && (
                <Link to="/notifications" className="notification-anchor me-3">
                  <div className="notif-icon-circle">
                    <FaBell />
                  </div>
                  {unreadCount > 0 && (
                    <span className="notif-badge-pill">{unreadCount}</span>
                  )}
                </Link>
              )}

              {/* USER PROFILE PILL */}
              <NavDropdown 
                title={
                  <div className="user-profile-pill">
                    {renderAvatar()}
                    <div className="user-info-text d-none d-md-flex">
                        <span className="user-nav-name">{user.username}</span>
                        <span className="user-nav-role">{user.role}</span>
                    </div>
                    <FaChevronDown className="nav-dropdown-caret" />
                  </div>
                } 
                id="user-nav-dropdown"
                align="end"
              >
                {!user.isFirstLogin && (
                    <><NavDropdown.Item as={Link} to="/profile"><FaUser className="me-2 text-primary" /> My Profile</NavDropdown.Item><NavDropdown.Divider /></>
                )}
                <NavDropdown.Item onClick={logout} className="logout-item"><FaSignOutAlt className="me-2" /> Logout</NavDropdown.Item>
              </NavDropdown>

            </div>
          </Container>
        </Navbar>
        
        <main className="main-content-area">
          <Container fluid className="p-3">
            <Routes>
              {/* Setup Route */}
              <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} />

              {/* Main App Routes */}
              <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} /> {/* NEW CHAT ROUTE */}
              <Route path="/jobcards" element={<ProtectedRoute><JobcardsPage /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/drugs" element={<ProtectedRoute><DrugManagementPage /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
              <Route path="/hardware" element={<ProtectedRoute><HardwarePage /></ProtectedRoute>} />
              <Route path="/wise-paas" element={<ProtectedRoute><WisePaasPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
              <Route path="/consumptions" element={<ProtectedRoute><ConsumptionPage /></ProtectedRoute>} />
              
              {/* Archive Routes */}
              <Route path="/users/archive" element={<ProtectedRoute><ArchivedUsersPage /></ProtectedRoute>} />
              <Route path="/hardware/archive" element={<ProtectedRoute><ArchivedHardwarePage /></ProtectedRoute>} />
              <Route path="/inventory/archive" element={<ProtectedRoute><ArchivedInventoryPage /></ProtectedRoute>} />
              <Route path="/drugs/archive" element={<ProtectedRoute><ArchivedDrugsPage /></ProtectedRoute>} />
              <Route path="/jobcards/archive" element={<ProtectedRoute><ArchivedJobcardsPage /></ProtectedRoute>} />
              <Route path="/reports/archive" element={<ProtectedRoute><ArchivedReportsPage /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/face-id" element={<ProtectedRoute><AdminRoute><FaceIdPage /></AdminRoute></ProtectedRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            </Routes>
          </Container>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

/**
 * Wrapped heavily with Providers for global state context
 */
function App() {
    return (
        <NotificationProvider>
            <ChatProvider>
                <AppContent />
            </ChatProvider>
        </NotificationProvider>
    );
}

export default App;