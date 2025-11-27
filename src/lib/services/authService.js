import { supabase } from '../config/supabase';

/**
 * Authentication Service
 * Handles all auth operations with Supabase
 */

class AuthService {
    /**
     * Register new user
     */
    async register(email, password, username) {
        try {
            // 1. Create auth user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (authError) throw authError;

            // 2. Create user profile in Users table
            const { data: userData, error: userError } = await supabase
                .from('Users')
                .insert({
                    Email: email,
                    Username: username,
                    Rank: 0,
                    Stones: 1000, // Starting stones
                    VipStatus: 'none',
                    AlchemyLevel: 1,
                    AlchemyExp: 0
                })
                .select()
                .single();

            if (userError) throw userError;

            return {
                success: true,
                user: authData.user,
                profile: userData,
                session: authData.session
            };
        } catch (error) {
            console.error('Register error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Get user profile
            const { data: profile } = await supabase
                .from('Users')
                .select('*')
                .eq('Email', email)
                .single();

            return {
                success: true,
                user: data.user,
                session: data.session,
                profile: profile
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // Clear local storage
            localStorage.removeItem('supabase.auth.token');

            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get current session
     */
    async getSession() {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            return data.session;
        } catch (error) {
            console.error('Get session error:', error);
            return null;
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser() {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            return data.user;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }

    /**
     * Get access token for API calls
     */
    async getAccessToken() {
        const session = await this.getSession();
        return session?.access_token || null;
    }

    /**
     * Refresh session
     */
    async refreshSession() {
        try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) throw error;
            return data.session;
        } catch (error) {
            console.error('Refresh session error:', error);
            return null;
        }
    }
}

export const authService = new AuthService();
