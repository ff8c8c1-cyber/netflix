/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

const { supabase } = require('../config/supabase');

/**
 * Require authentication - verifies token exists and is valid
 * Attaches user object to req.user
 */
const requireAuth = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No authentication token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token'
            });
        }

        // Get full user data from Users table
        const { data: userData, error: userError } = await supabase
            .from('Users')
            .select('*')
            .eq('SupabaseId', user.id)
            .maybeSingle();

        if (userError) {
            console.error('Error fetching user data:', userError);
            return res.status(500).json({
                error: 'Server error',
                message: 'Failed to fetch user data'
            });
        }

        // Attach user to request
        req.user = userData || { SupabaseId: user.id };
        req.userId = userData?.Id;

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication failed'
        });
    }
};

/**
 * Verify resource ownership
 * Checks if authenticated user owns the resource (based on :userId param)
 */
const verifyOwnership = (req, res, next) => {
    const { userId } = req.params;

    // If no userId in params, skip check
    if (!userId) {
        return next();
    }

    // Check if authenticated user matches resource owner
    if (req.userId && req.userId.toString() === userId.toString()) {
        return next();
    }

    // Check for admin role (if you have admin system)
    if (req.user?.IsAdmin) {
        return next();
    }

    return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
    });
};

/**
 * Optional auth - doesn't fail if no token
 * Useful for routes that work differently for logged in users
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // No token, continue without user
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (!error && user) {
            const { data: userData } = await supabase
                .from('Users')
                .select('*')
                .eq('SupabaseId', user.id)
                .maybeSingle();

            req.user = userData || { SupabaseId: user.id };
            req.userId = userData?.Id;
        }

        next();
    } catch (err) {
        // Don't fail, just continue without user
        next();
    }
};

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.IsAdmin) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Admin access required'
        });
    }
    next();
};

module.exports = {
    requireAuth,
    verifyOwnership,
    optionalAuth,
    requireAdmin
};
