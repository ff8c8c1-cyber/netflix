const socketIo = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Allow all origins for development
            methods: ["GET", "POST"]
        }
    });

    const roomStates = {}; // { roomId: { videoUrl, isPlaying, timestamp, lastUpdated } }

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join Room
        socket.on('join_room', (data) => {
            const { roomId, username } = data;
            socket.join(roomId);
            console.log(`User ${username} (${socket.id}) joined room: ${roomId}`);

            // Notify others
            socket.to(roomId).emit('user_joined', { username, message: `${username} has joined the party!` });

            // Send current room state to the new user
            if (roomStates[roomId]) {
                socket.emit('current_room_state', roomStates[roomId]);
            }
        });

        // Leave Room
        socket.on('leave_room', (data) => {
            const { roomId, username } = data;
            socket.leave(roomId);
            console.log(`User ${username} left room: ${roomId}`);
            socket.to(roomId).emit('user_left', { username, message: `${username} has left.` });
        });

        // Chat Message
        socket.on('send_message', (data) => {
            const { roomId, message, username, timestamp } = data;
            io.to(roomId).emit('receive_message', { username, message, timestamp });
        });

        // Video Sync Events
        socket.on('sync_video', (data) => {
            const { roomId, action, payload } = data;
            console.log(`🔄 Sync Event in ${roomId}: ${action}`, payload);

            // Update server-side state
            if (!roomStates[roomId]) roomStates[roomId] = { videoUrl: '', isPlaying: false, timestamp: 0 };

            if (action === 'url_change') {
                console.log(`🎥 URL Change requested: ${payload.url}`);
                roomStates[roomId].videoUrl = payload.url;
            }
            if (action === 'play') roomStates[roomId].isPlaying = true;
            if (action === 'pause') roomStates[roomId].isPlaying = false;
            if (action === 'seek') roomStates[roomId].timestamp = payload.timestamp;

            roomStates[roomId].lastUpdated = Date.now();
            console.log(`💾 Room State Updated:`, roomStates[roomId]);

            // Broadcast to everyone else
            socket.to(roomId).emit('receive_sync', { action, payload });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

module.exports = { initializeSocket };
