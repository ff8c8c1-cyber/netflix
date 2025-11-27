const { query } = require('./db');
const fs = require('fs');
const path = require('path');

const runUpdate = async () => {
    try {
        const sqlPath = path.join(__dirname, '..', 'create_auction_market.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await query(sql);
        console.log('Auction & Black Market schema updated successfully!');
    } catch (err) {
        console.error('Error updating schema:', err);
    }
};

runUpdate();
