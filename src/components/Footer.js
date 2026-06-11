import React from 'react';
import { Container } from 'react-bootstrap';
import './Footer.css'; 

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <Container fluid className="footer-container px-4">
                <div className="footer-content">
                    <div className="footer-left">
                        <span className="footer-brand">TheDilution System</span>
                    </div>

                    <div className="footer-center">
                        <p className="footer-copyright">
                            © {currentYear} <strong>TheDilution</strong>. All Rights Reserved.
                        </p>
                    </div>

                    <div className="footer-right">
                        <a href="#privacy" className="footer-link">
                            Privacy
                        </a>
                        <span className="footer-divider"></span>
                        <a href="#support" className="footer-link">
                            Support
                        </a>
                        <span className="footer-divider"></span>
                        <span className="footer-version">v1.0.0</span>
                    </div>
                </div>
            </Container>
        </footer>
    );
}

export default Footer;