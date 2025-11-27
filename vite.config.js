import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        // Chunk size warning limit
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                // Manual chunk splitting for better caching
                manualChunks: {
                    // React core
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],

                    // Three.js and 3D libraries (heavy)
                    'three': ['three', '@react-three/fiber', '@react-three/drei'],

                    // Socket.IO for real-time features
                    'socket': ['socket.io-client'],

                    // UI/Animation libraries
                    'ui-libs': ['framer-motion', 'react-hot-toast', 'lucide-react'],

                    // Zustand state management
                    'state': ['zustand'],

                    // Supabase client
                    'supabase': ['@supabase/supabase-js'],

                    // Video player
                    'video': ['react-player']
                },
                // Clean filenames
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
            }
        }
    },
    server: {
        port: 5173,
        open: true
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom']
    }
})
