const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3000';
const ROOM_ID = 'test-room-123';
const VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';

async function testWatchParty() {
    console.log('--- Starting Watch Party Simulation ---');

    // 1. Host Connects
    const hostSocket = io(SOCKET_URL);

    await new Promise(resolve => hostSocket.on('connect', resolve));
    console.log('✅ Host connected:', hostSocket.id);

    // 2. Host Joins Room
    hostSocket.emit('join_room', { roomId: ROOM_ID, username: 'HostUser' });
    console.log('🔹 Host joined room');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. Host Sets Video URL (Simulating loading a movie)
    console.log('🔹 Host setting video URL:', VIDEO_URL);
    hostSocket.emit('sync_video', {
        roomId: ROOM_ID,
        action: 'url_change',
        payload: { url: VIDEO_URL }
    });

    // Wait for server to update state
    await new Promise(resolve => setTimeout(resolve, 500));

    // 4. Guest Connects
    const guestSocket = io(SOCKET_URL);
    await new Promise(resolve => guestSocket.on('connect', resolve));
    console.log('✅ Guest connected:', guestSocket.id);

    // 5. Guest Joins Room & Expects State
    return new Promise((resolve, reject) => {
        let stateReceived = false;

        guestSocket.on('current_room_state', (state) => {
            console.log('📥 Guest received room state:', state);
            if (state.videoUrl === VIDEO_URL) {
                console.log('✅ SUCCESS: Guest received correct video URL!');
                stateReceived = true;
                cleanup();
                resolve();
            } else {
                console.error('❌ FAILURE: Guest received wrong URL:', state.videoUrl);
                cleanup();
                reject(new Error('Wrong URL'));
            }
        });

        guestSocket.emit('join_room', { roomId: ROOM_ID, username: 'GuestUser' });
        console.log('🔹 Guest joined room');

        // Timeout if no state received
        setTimeout(() => {
            if (!stateReceived) {
                console.error('❌ FAILURE: Guest did not receive room state in time.');
                cleanup();
                reject(new Error('Timeout'));
            }
        }, 3000);

        function cleanup() {
            hostSocket.close();
            guestSocket.close();
        }
    });
}

testWatchParty().catch(err => {
    console.error('Test Failed:', err);
    process.exit(1);
});
