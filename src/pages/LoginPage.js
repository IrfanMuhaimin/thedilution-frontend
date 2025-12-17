import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import loginBackground from '../assets/login-background.jpg';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
        {/* Left Column: Image Background */}
        {/* This column is hidden on medium screens and below (d-none d-md-block) */}
        <Col 
          md={7} 
          className="login-image-section d-none d-md-block"
          style={{ backgroundImage: `url(${loginBackground})` }}
        ></Col>

        {/* Right Column: Login Form */}
        <Col md={5} className="login-form-section d-flex align-items-center justify-content-center">
          <div className="w-100" style={{ maxWidth: '400px' }}>
            
            <div className="text-center mb-5">
              <h1 className="fw-bold" style={{ color: 'var(--color-primary)' }}>TheDilution System</h1>
              <p className="text-muted">Welcome! Please log in to your account.</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </Form.Group>

              <Button disabled={loading} className="btn-custom-primary w-100 mt-4" type="submit">
                {loading 
                  ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> 
                  : 'Sign In'
                }
              </Button>
            </Form>

          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;