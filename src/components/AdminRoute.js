import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-bootstrap';

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (user.role !== 'Admin') {
    // If user is not an Admin, redirect them to the dashboard
    // and show a temporary "permission denied" message.
    return (
        <>
            <Alert variant="danger">
                Access Denied: You do not have permission to view this page.
            </Alert>
            <Navigate to="/" />
        </>
    );
  }

  // If user is an Admin, render the component they are trying to access
  return children;
}

export default AdminRoute;