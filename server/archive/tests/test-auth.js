
const { execute } = require('./db');

async function testAuth() {
    const testUser = 'testuser_' + Date.now();
    const testPass = '123456';
    const testEmail = 'test@example.com';

    console.log(`Testing with User: ${testUser}, Pass: ${testPass}`);

    try {
        // 1. Register
        console.log('1. Registering...');
        const regResult = await execute('sp_RegisterUser', {
            Username: testUser,
            PasswordHash: testPass,
            Email: testEmail
        });
        console.log('Register Result:', regResult.recordset[0]);

        // 2. Login
        console.log('2. Logging in...');
        const loginResult = await execute('sp_LoginUser', {
            Username: testUser
        });
        const user = loginResult.recordset[0];
        console.log('User from DB:', user);

        if (!user) {
            console.error('Login Failed: User not found');
            return;
        }

        if (user.PasswordHash !== testPass) {
            console.error(`Login Failed: Password mismatch. DB: '${user.PasswordHash}' vs Input: '${testPass}'`);
            console.log('Type of DB Pass:', typeof user.PasswordHash);
            console.log('Type of Input Pass:', typeof testPass);
            console.log('Length DB:', user.PasswordHash.length, 'Length Input:', testPass.length);
        } else {
            console.log('Login Successful!');
        }

    } catch (err) {
        console.error('Test Error:', err);
    }
}

testAuth();
