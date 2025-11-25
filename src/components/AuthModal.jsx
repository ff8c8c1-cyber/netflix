import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Loader } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { supabase } from '../lib/supabase';

const AuthModal = ({ onClose, initialMode = 'login' }) => {
    const { signIn, signUp, addLog, initializeAuth } = useGameStore();
    const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(''); // Clear error on input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (mode === 'signup') {
                if (!formData.username.trim()) {
                    throw new Error('Vui lòng nhập tên người dùng');
                }
                if (formData.password.length < 6) {
                    throw new Error('Mật khẩu phải ít nhất 6 ký tự');
                }
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Mật khẩu xác nhận không khớp');
                }

                const result = await signUp(formData.email, formData.password, formData.username);
                addLog('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.', 'success');
                onClose();
            } else {
                const result = await signIn(formData.email, formData.password);
                await initializeAuth(); // Refresh user state
                addLog('Đăng nhập thành công!', 'success');
                onClose();
            }
        } catch (error) {
            console.error('Auth error:', error);
            setError(error.message || 'Lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError('');
        setFormData({
            email: formData.email, // Keep email when switching
            password: '',
            username: '',
            confirmPassword: ''
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Welcome Text */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} className="text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                        Chào mừng đến với Tiên Giới!
                    </h3>
                    <p className="text-gray-400 text-sm">
                        {mode === 'login'
                            ? 'Đăng nhập để tiếp tục hành trình tu luyện'
                            : 'Tạo tài khoản để bắt đầu hành trình tu chân'
                        }
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username (Signup only) */}
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Tên Người Dùng
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Tên hiển thị của bạn"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Email/Username */}
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Email hoặc Tên đăng nhập
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Email hoặc Tên đăng nhập"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Mật Khẩu
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {mode === 'signup' && (
                            <p className="text-gray-500 text-xs mt-1">Ít nhất 6 ký tự</p>
                        )}
                    </div>

                    {/* Confirm Password (Signup only) */}
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Xác Nhận Mật Khẩu
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    placeholder="Nhập lại mật khẩu"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
                            </>
                        )}
                    </button>
                </form>

                {/* Mode Switch */}
                <div className="text-center mt-6 pt-6 border-t border-gray-700">
                    <p className="text-gray-400 text-sm">
                        {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                        <button
                            onClick={switchMode}
                            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                        >
                            {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                        </button>
                    </p>
                </div>

                {/* Terms (Signup only) */}
                {mode === 'signup' && (
                    <div className="mt-4 text-center">
                        <p className="text-gray-500 text-xs">
                            Bằng việc đăng ký, bạn đồng ý với{' '}
                            <a href="#" className="text-cyan-400 hover:text-cyan-300">
                                Điều khoản dịch vụ
                            </a>{' '}
                            và{' '}
                            <a href="#" className="text-cyan-400 hover:text-cyan-300">
                                Chính sách bảo mật
                            </a>
                        </p>
                    </div>
                )}

                {/* Social Login Placeholder */}
                <div className="mt-6 space-y-3">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-900 text-gray-400">Hoặc tiếp tục với</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg transition-colors text-sm font-medium"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                            </svg>
                            Twitter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
