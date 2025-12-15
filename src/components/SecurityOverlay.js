import React, { useState, useEffect, useRef, useCallback } from 'react';
// --- THIS IS THE CORRECTED IMPORT LINE ---
import { Spinner, Alert, Button } from 'react-bootstrap'; 
import * as faceRecognitionService from '../services/faceRecognitionService';
import '../styles/SecurityOverlay.css';

// The 'onClose' prop is new. It's a function passed from the parent.
function SecurityOverlay({ isVisible, onVerified, onClose }) {
    const [status, setStatus] = useState('Initializing...');
    const [statusClass, setStatusClass] = useState('status-scanning');
    const [videoUrl, setVideoUrl] = useState('');
    const [error, setError] = useState({ type: '', message: '' });
    const verificationInterval = useRef(null);

    // A retry function to restart the verification process
    const startVerification = useCallback(async () => {
        // Reset all states before retrying
        setError({ type: '', message: '' });
        setStatus('Connecting...');
        setStatusClass('status-scanning');
        setVideoUrl(''); // Ensure video is cleared before retry

        // Clear any lingering intervals
        if (verificationInterval.current) {
            clearInterval(verificationInterval.current);
        }

        try {
            await faceRecognitionService.startVerificationMode();
            setStatus('Scanning...');
            setTimeout(() => setVideoUrl(faceRecognitionService.getVideoFeedUrl()), 200);

            verificationInterval.current = setInterval(async () => {
                try {
                    const data = await faceRecognitionService.checkVerificationStatus();
                    if (data.verified === true) {
                        clearInterval(verificationInterval.current);
                        setVideoUrl('');
                        setStatus(`Verified: ${data.user}`);
                        setStatusClass('status-verified');
                        setTimeout(() => onVerified(), 1500);
                    }
                } catch (pollError) {
                    setError({ type: 'lost_connection', message: 'Lost connection to the security module.' });
                    setStatusClass('status-error');
                    clearInterval(verificationInterval.current);
                }
            }, 1000);

        } catch (initialError) {
            setError({ type: 'incompatible', message: 'Incompatible Device: Could not connect to the Face ID module.' });
            setStatusClass('status-error');
        }
    }, [onVerified]); // useCallback dependency

    useEffect(() => {
        if (isVisible) {
            startVerification(); // Initial attempt when the overlay becomes visible
        }

        // Cleanup function for when the component is hidden or unmounts
        return () => {
            if (verificationInterval.current) {
                clearInterval(verificationInterval.current);
            }
        };
    }, [isVisible, startVerification]);

    if (!isVisible) {
        return null;
    }

    // Determine what content to show in the main area
    let content;
    if (error.type) {
        content = (
            <div className="video-placeholder">
                <Alert variant="danger" className="m-0 text-center">
                    <Alert.Heading>{error.type === 'incompatible' ? 'Device Not Compatible' : 'Connection Error'}</Alert.Heading>
                    <p className="mb-0">{error.message}</p>
                </Alert>
            </div>
        );
    } else {
        content = videoUrl ? (
            <iframe src={videoUrl} title="Verification Feed" scrolling="no"></iframe>
        ) : (
            <div className="video-placeholder">
                <Spinner animation="border" variant="light" />
                <p className="mt-2 mb-0">{status}</p>
            </div>
        );
    }

    return (
        <div className="security-overlay">
            <h1>Security Check</h1>
            <p>Facial Verification Required</p>
            <div className="video-frame-container">{content}</div>
            
            {/* Conditionally render buttons on error */}
            {error.type ? (
                <div className="error-actions mt-4">
                    <Button variant="light" onClick={startVerification} className="me-3">
                        Retry Scan
                    </Button>
                    <Button variant="outline-secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            ) : (
                <div className={`status-box ${statusClass}`}>
                    {status}
                </div>
            )}
        </div>
    );
}

export default SecurityOverlay;