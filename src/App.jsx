import React, { useState, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { useGameStore } from './store/useGameStore';
import { PageSkeleton } from './components/LoadingSkeleton';

// Lazy load components for better performance
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const MainLayout = React.lazy(() => import('./layouts/MainLayout'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const MarketPage = React.lazy(() => import('./pages/MarketPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const WatchPage = React.lazy(() => import('./pages/WatchPage'));
const SectPage = React.lazy(() => import('./pages/SectPage'));
const CultivationPage = React.lazy(() => import('./pages/CultivationPage'));
const PetPage = React.lazy(() => import('./pages/PetPage'));
const PvPPage = React.lazy(() => import('./pages/PvPPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage'));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));
const AIAssistant = React.lazy(() => import('./components/AIAssistant'));
const WatchPartyPage = React.lazy(() => import('./pages/WatchPartyPage'));
const VIPPage = React.lazy(() => import('./pages/VIPPage'));
const AlchemyPage = React.lazy(() => import('./pages/AlchemyPage'));

function App() {
    const [isReady, setIsReady] = useState(false);
    const { initDatabase, initializeAuth } = useGameStore();

    // Simple loading component (still used for initial app load)
    const LoadingFallback = () => (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a0a0a] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading Xianxia Universe...</p>
            </div>
        </div>
    );

    useEffect(() => {
        const initializeApp = async () => {
            console.log('🚀 Initializing App...');

            // Initialize database with sample data
            await initDatabase();
            await initializeAuth();

            // Check daily login missions
            useGameStore.getState().checkDailyLogin();

            // Simple delay to ensure everything is loaded
            const timer = setTimeout(() => {
                console.log('✅ App initialization complete');
                setIsReady(true);
            }, 300);

            return () => clearTimeout(timer);
        };

        initializeApp();
    }, [initDatabase]);

    if (!isReady) {
        return <LoadingFallback />;
    }

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Suspense fallback={<PageSkeleton />}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<HomePage />} />
                            <Route path="search" element={<SearchPage />} />
                            <Route path="market" element={<MarketPage />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="watch/:id" element={<WatchPage />} />
                            <Route path="cultivation" element={<CultivationPage />} />
                            <Route path="pet" element={<PetPage />} />
                            <Route path="pvp" element={<PvPPage />} />
                            <Route path="sect" element={<SectPage />} />
                            <Route path="vip" element={<VIPPage />} />
                            <Route path="alchemy" element={<AlchemyPage />} />
                            <Route path="favorites" element={<FavoritesPage />} />
                            <Route path="history" element={<HistoryPage />} />
                            <Route path="watch-party/:roomId" element={<WatchPartyPage />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                    <AIAssistant />
                </Suspense>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
