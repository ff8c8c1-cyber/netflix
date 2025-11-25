import React from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        // Send error to error reporting service (placeholder)
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: `Error: ${error.message} - ${errorInfo.componentStack}`,
                fatal: false
            });
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleReportBug = () => {
        const errorDetails = encodeURIComponent(`
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
ComponentStack: ${this.state.errorInfo?.componentStack}
URL: ${window.location.href}
UserAgent: ${navigator.userAgent}
        `.trim());

        // Open email client or send to bug report service
        window.open(`mailto:support@xianxiastream.dev?subject=Bug Report&body=${errorDetails}`);
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a0a0a] flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center">
                        <div className="mb-8">
                            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <AlertTriangle size={40} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">
                                Ối Không! Có Lỗi Xảy Ra
                            </h1>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Tiên Giới của chúng ta gặp chút trục trặc kỹ thuật. Đừng lo lắng, giới sư tu chân đang chỉnh sửa ngay đây!
                            </p>

                            {/* Error Details (only in development) */}
                            {process.env.NODE_ENV === 'development' && (
                                <details className="text-left bg-gray-900 p-4 rounded-lg mb-6 border border-gray-700">
                                    <summary className="text-cyan-400 font-medium cursor-pointer mb-2">
                                        Chi tiết kỹ thuật (Dev Only)
                                    </summary>
                                    <div className="text-red-400 text-sm font-mono bg-gray-800 p-3 rounded overflow-auto max-h-48">
                                        <div className="mb-2">
                                            <strong>Error Message:</strong><br />
                                            {this.state.error?.message}
                                        </div>
                                        <div>
                                            <strong>Component:</strong><br />
                                            <div className="text-xs mt-1">
                                                {this.state.errorInfo?.componentStack.split('\n').slice(0, 5).join('\n')}
                                            </div>
                                        </div>
                                    </div>
                                </details>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={this.handleReload}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Thử Lại Trang
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Home size={18} />
                                Về Trang Chủ
                            </button>

                            <button
                                onClick={this.handleReportBug}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={18} />
                                Báo Lỗi
                            </button>
                        </div>

                        {/* Fun Message */}
                        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                            <p className="text-gray-400 text-sm italic">
                                "Trong con đường tu tiên, dù gặp tai họa hay hiểm nguy, chúng ta vẫn luôn đứng vững để tiếp tục hành trình!"
                            </p>
                            <p className="text-cyan-400 text-xs mt-2 font-medium">
                                — Đại Tiên Giới
                            </p>
                        </div>

                        {/* Contact Info */}
                        <div className="mt-6 text-gray-500 text-xs">
                            Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ hỗ trợ tại{' '}
                            <a
                                href="mailto:support@xianxiastream.dev"
                                className="text-cyan-400 hover:text-cyan-300 underline"
                            >
                                support@xianxiastream.dev
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
