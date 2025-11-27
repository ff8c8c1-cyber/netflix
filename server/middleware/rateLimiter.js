/**
 * Rate Limiting Middleware
 * Prevents API abuse and DDoS attacks
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests',
        message: 'You have exceeded the 100 requests in 15 minutes limit!',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for auth endpoints
 * 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Too many authentication attempts',
        message: 'Please try again after 15 minutes',
        retryAfter: '15 minutes'
    },
    skipSuccessfulRequests: false, // Count successful requests
});

/**
 * Moderate limiter for actions (crafting, buying, etc.)
 * 30 requests per minute
 */
const actionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: {
        error: 'Too many actions',
        message: 'Please slow down. Max 30 actions per minute.',
        retryAfter: '1 minute'
    },
});

/**
 * PvP action limiter
 * 10 battles per minute
 */
const pvpLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        error: 'Too many battles',
        message: 'Max 10 battles per minute',
        retryAfter: '1 minute'
    },
});

module.exports = {
    apiLimiter,
    authLimiter,
    actionLimiter,
    pvpLimiter
};
