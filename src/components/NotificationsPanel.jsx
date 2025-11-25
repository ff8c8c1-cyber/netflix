import React, { useState, useEffect } from 'react';
import {
    Bell, Check, X, Trash2, Settings,
    TrendingUp, MessageCircle, Trophy, Star,
    Users, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { notificationService } from '../lib/services';
import { supabase } from '../lib/supabase';

const NotificationsPanel = ({ onClose }) => {
    const user = useGameStore(state => state.user);
    const addLog = useGameStore(state => state.addLog);

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);
    const [filter, setFilter] = useState('all'); // all, unread, read

    // Load notifications
    const loadNotifications = async () => {
        if (!user) return;

        try {
            const data = await notificationService.getUserNotifications(user.id, 50);
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Subscribe to real-time notifications
    useEffect(() => {
        if (!user) return;

        loadNotifications();

        const channel = supabase
            .channel('user_notifications')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
                    loadNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Mark as read
    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId, user.id);
            loadNotifications(); // Refresh list
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        if (!user) return;

        setMarkingAll(true);
        try {
            await notificationService.markAllAsRead(user.id);
            loadNotifications();
            addLog('Đã đánh dấu tất cả thông báo là đã đọc', 'success');
        } catch (error) {
            console.error('Error marking all notifications:', error);
            addLog('Lỗi khi cập nhật thông báo', 'error');
        } finally {
            setMarkingAll(false);
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId)
                .eq('user_id', user.id);

            if (error) throw error;

            loadNotifications();
            addLog('Đã xóa thông báo', 'success');
        } catch (error) {
            console.error('Error deleting notification:', error);
            addLog('Lỗi khi xóa thông báo', 'error');
        }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(notification => {
        switch (filter) {
            case 'unread':
                return !notification.is_read;
            case 'read':
                return notification.is_read;
            default:
                return true;
        }
    });

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
            case 'achievement':
                return Trophy;
            case 'comment':
                return MessageCircle;
            case 'rating':
                return Star;
            case 'social':
                return Users;
            case 'update':
                return TrendingUp;
            case 'warning':
                return AlertTriangle;
            case 'completed':
                return CheckCircle;
            default:
                return Info;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'success':
            case 'achievement':
                return 'text-green-400 bg-green-900/20';
            case 'warning':
                return 'text-yellow-400 bg-yellow-900/20';
            case 'social':
                return 'text-blue-400 bg-blue-900/20';
            case 'completed':
                return 'text-green-400 bg-green-900/20';
            default:
                return 'text-cyan-400 bg-cyan-900/20';
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="fixed right-4 top-20 bg-gray-900 border border-gray-700 rounded-xl p-6 w-96 z-40">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-700 rounded"></div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed right-4 top-20 bg-gray-900 border border-gray-700 rounded-xl w-96 max-h-[80vh] overflow-hidden z-40 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Bell size={20} className="text-cyan-400" />
                        <h3 className="text-white font-bold">Thông Báo</h3>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={markingAll}
                                className="text-gray-400 hover:text-cyan-400 text-sm disabled:opacity-50"
                            >
                                {markingAll ? '...' : 'Đánh dấu tất cả'}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                    {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'unread', label: 'Chưa đọc', count: unreadCount },
                        { id: 'read', label: 'Đã đọc' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`flex-1 text-center py-2 px-3 rounded-md text-sm font-medium transition-all ${filter === tab.id
                                ? 'bg-cyan-600 text-white'
                                : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="ml-1 bg-red-500 text-white px-1 py-0.5 rounded-full text-xs">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <Bell size={48} className="text-gray-600 mx-auto mb-4" />
                        <h4 className="text-gray-400 font-medium mb-2">
                            {filter === 'unread'
                                ? 'Không có thông báo chưa đọc'
                                : filter === 'read'
                                    ? 'Không có thông báo đã đọc'
                                    : 'Chưa có thông báo nào'
                            }
                        </h4>
                        <p className="text-gray-500 text-sm">
                            Thông báo sẽ xuất hiện khi có hoạt động mới
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-700">
                        {filteredNotifications.map((notification) => {
                            const IconComponent = getNotificationIcon(notification.type);
                            return (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-800/50 transition-colors ${!notification.is_read ? 'border-l-4 border-cyan-500 bg-cyan-900/10' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                                            <IconComponent size={14} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <h4 className={`font-medium text-sm leading-5 ${notification.is_read ? 'text-gray-300' : 'text-white'
                                                        }`}>
                                                        {notification.title}
                                                    </h4>
                                                    {notification.content && (
                                                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                                            {notification.content}
                                                        </p>
                                                    )}
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        {formatTimeAgo(notification.created_at)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1 ml-2">
                                                    {!notification.is_read && (
                                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                                    )}
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!notification.is_read && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="text-gray-400 hover:text-cyan-400 p-1 rounded transition-colors"
                                                                title="Đánh dấu đã đọc"
                                                            >
                                                                <Check size={12} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteNotification(notification.id)}
                                                            className="text-gray-400 hover:text-red-400 p-1 rounded transition-colors"
                                                            title="Xóa thông báo"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{filteredNotifications.length} thông báo</span>
                        <button className="text-cyan-400 hover:text-cyan-300">
                            <Settings size={12} className="inline ml-1" />
                            Cài đặt thông báo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPanel;
