const { query } = require('./db');
const fs = require('fs');
const path = require('path');

const runUpdate = async () => {
    try {
        const sqlPath = path.join(__dirname, '..', 'add_role_salary_column.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await query(sql);
        console.log('Added RoleSalaryClaimedAt column successfully!');
    } catch (err) {
        console.error('Error updating schema:', err);
    }
};

runUpdate();
