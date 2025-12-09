import React from 'react';
import { Container } from 'react-bootstrap';
import './Footer.css'; 

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer text-center py-3">
            <Container>
                <p className="mb-0">
                    Copyright &copy; {currentYear} The Dilution System. All Rights Reserved.
                </p>
            </Container>
        </footer>
    );
}

export default Footer;