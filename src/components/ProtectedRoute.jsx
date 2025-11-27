import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';

/**
 * Protected Route Component
 * Redirects to /login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
    const { user } = useGameStore();

    // Check if user is authenticated
    if (!user || !user.id) {
        // Redirect to login page
        return <Navigate to="/login" replace />;
    }

    // User is authenticated, render children
    return children;
};

export default ProtectedRoute;
