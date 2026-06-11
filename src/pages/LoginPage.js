import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaExclamationCircle, FaEye, FaEyeSlash } from 'react-icons/fa'; // NEW
import loginBackground from '../assets/login-background.jpg';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // NEW
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionAlert, setSessionAlert] = useState('');
  
  const { login } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.sessionMessage) {
        setSessionAlert(location.state.sessionMessage);
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSessionAlert('');
    setLoading(true);
    
    const result = await login(username, password);
    setLoading(false);
    if (!result.success) {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Container fluid className="p-0">
      <Row className="g-0 min-vh-100">
        <Col md={7} className="login-image-section d-none d-md-block" style={{ backgroundImage: `url(${loginBackground})` }}></Col>
        <Col md={5} className="login-form-section d-flex align-items-center justify-content-center">
          <div className="w-100" style={{ maxWidth: '400px' }}>
            <div className="text-center mb-5">
              <h1 className="fw-bold" style={{ color: 'var(--primary-blue)' }}>TheDilution System</h1>
              <p className="text-muted">Welcome! Please log in to your account.</p>
            </div>

            {sessionAlert && (
                <Alert variant="warning" className="d-flex align-items-center rounded-3 border-0 shadow-sm" style={{ background: '#fffbeb', color: '#b45309' }}>
                    <FaExclamationCircle size={20} className="me-3" />
                    <div>{sessionAlert}</div>
                </Alert>
            )}

            {error && <Alert variant="danger" className="rounded-3 border-0 shadow-sm">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                {/* --- NEW PASSWORD TOGGLE --- */}
                <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"} // Dynamic Type
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="border-end-0"
                    />
                    <InputGroup.Text 
                        onClick={() => setShowPassword(!showPassword)} 
                        style={{ cursor: 'pointer', background: '#fafbfc', borderLeft: 'none' }}
                        className="text-muted"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Button disabled={loading} className="btn-custom-primary w-100 py-2 rounded-pill shadow" type="submit">
                {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Secure Sign In'}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;