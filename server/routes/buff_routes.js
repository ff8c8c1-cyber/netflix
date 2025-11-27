const express = require('express');
const router = express.Router();

// GET /api/users/:userId/buffs
router.get('/:userId/buffs', async (req, res) => {
    res.json({ buffs: [] });
});

// POST /api/buffs/apply
router.post('/apply', async (req, res) => {
    res.json({ success: false, message: 'Not implemented yet' });
});

// DELETE /api/buffs/:buffId
router.delete('/:buffId', async (req, res) => {
    res.json({ success: false });
});

// POST /api/buffs/cleanup
router.post('/cleanup', async (req, res) => {
    res.json({ success: true, expiredCount: 0 });
});

module.exports = router;
