/**
 * Input Validation Middleware
 * Sanitizes and validates user inputs
 */

/**
 * Sanitize string input - remove dangerous characters
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;

    // Remove potential SQL injection patterns
    return str
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/['";]/g, '') // Remove quotes and semicolons
        .trim();
};

/**
 * Validate and sanitize request body
 */
const validateBody = (requiredFields = []) => {
    return (req, res, next) => {
        // Check required fields exist
        for (const field of requiredFields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                return res.status(400).json({
                    error: 'Validation error',
                    message: `Missing required field: ${field}`
                });
            }
        }

        // Sanitize all string fields
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeString(req.body[key]);
            }
        }

        next();
    };
};

/**
 * Validate userId parameter
 */
const validateUserId = (req, res, next) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'User ID is required'
        });
    }

    // Check if userId is a valid number
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum) || userIdNum < 1) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Invalid User ID format'
        });
    }

    req.params.userId = userIdNum;
    next();
};

/**
 * Validate item ID
 */
const validateItemId = (req, res, next) => {
    const itemId = req.body.itemId || req.params.itemId;

    if (!itemId) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Item ID is required'
        });
    }

    const itemIdNum = parseInt(itemId, 10);
    if (isNaN(itemIdNum) || itemIdNum < 1) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Invalid Item ID format'
        });
    }

    if (req.body.itemId) req.body.itemId = itemIdNum;
    if (req.params.itemId) req.params.itemId = itemIdNum;
    next();
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
    let { page = 1, limit = 20 } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 100) limit = 20;

    req.query.page = page;
    req.query.limit = limit;
    next();
};

/**
 * Validate QTE score (0-100)
 */
const validateQTEScore = (req, res, next) => {
    let { qteScore } = req.body;

    if (qteScore === undefined || qteScore === null) {
        qteScore = 50; // Default
    }

    qteScore = parseFloat(qteScore);
    if (isNaN(qteScore) || qteScore < 0 || qteScore > 100) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'QTE score must be between 0 and 100'
        });
    }

    req.body.qteScore = qteScore;
    next();
};

/**
 * Prevent SQL injection in query params
 */
const sanitizeQuery = (req, res, next) => {
    for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
            req.query[key] = sanitizeString(req.query[key]);
        }
    }
    next();
};

module.exports = {
    validateBody,
    validateUserId,
    validateItemId,
    validatePagination,
    validateQTEScore,
    sanitizeQuery,
    sanitizeString
};
