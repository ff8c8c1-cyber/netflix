const sql = require('msnodesqlv8');
require('dotenv').config();

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const execute = (procedureName, params = {}) => {
    return new Promise((resolve, reject) => {
        sql.open(connectionString, (err, conn) => {
            if (err) {
                console.error('❌ Database connection failed:', err);
                return reject(err);
            }

            const paramNames = Object.keys(params);
            const paramValues = Object.values(params);

            let query = `EXEC ${procedureName}`;
            if (paramNames.length > 0) {
                const paramPlaceholders = paramNames.map(name => `@${name} = ?`).join(', ');
                query += ` ${paramPlaceholders}`;
            }

            console.log(`Executing: ${query} with params:`, paramValues);

            conn.query(query, paramValues, (err, rows) => {
                conn.close();
                if (err) {
                    console.error('❌ Query failed:', err);
                    return reject(err);
                }
                console.log('DB Rows:', rows);
                resolve({ recordset: rows });
            });
        });
    });
};

const query = (sqlQuery, params = []) => {
    return new Promise((resolve, reject) => {
        sql.open(connectionString, (err, conn) => {
            if (err) {
                console.error('❌ Database connection failed:', err);
                return reject(err);
            }

            conn.query(sqlQuery, params, (err, rows) => {
                conn.close();
                if (err) {
                    console.error('❌ Query failed:', err);
                    return reject(err);
                }
                resolve({ recordset: rows });
            });
        });
    });
};

module.exports = { execute, query };
