import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Send, Trash2 } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { commentService } from '../lib/services';

const CommentsSection = ({ movieId }) => {
    const { user } = useGameStore();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Load comments
    const loadComments = async () => {
        try {
            const data = await commentService.getMovieComments(movieId);
            setComments(data);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadComments();
    }, [movieId]);

    // Submit new comment
    const handleSubmitComment = async () => {
        if (!user || !newComment.trim()) return;

        setSubmitting(true);
        try {
            // Optimistic update
            const tempId = Date.now();
            const tempComment = {
                id: tempId,
                movie_id: movieId,
                user_id: user.id,
                username: user.username,
                avatar_url: user.avatar_url,
                content: newComment.trim(),
                created_at: new Date().toISOString(),
                likes: 0,
                parent_comment_id: null
            };
            setComments([tempComment, ...comments]);
            setNewComment('');

            await commentService.addComment(user.id, movieId, tempComment.content);
            loadComments(); // Refresh to get real ID
        } catch (error) {
            console.error('Error submitting comment:', error);
            loadComments(); // Revert on error
        } finally {
            setSubmitting(false);
        }
    };

    // Submit reply
    const handleSubmitReply = async (parentCommentId) => {
        if (!user || !replyText.trim()) return;

        setSubmitting(true);
        try {
            await commentService.addComment(user.id, movieId, replyText.trim(), parentCommentId);
            setReplyingTo(null);
            setReplyText('');
            loadComments();
        } catch (error) {
            console.error('Error submitting reply:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Like comment
    const handleLikeComment = async (commentId) => {
        if (!user) return;
        try {
            // Optimistic update
            setComments(comments.map(c =>
                c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
            ));
            await commentService.likeComment(commentId, user.id);
        } catch (error) {
            console.error('Error liking comment:', error);
            loadComments(); // Revert
        }
    };

    // Delete comment
    const handleDeleteComment = async (commentId) => {
        if (!user) return;

        if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
            try {
                // Optimistic update
                setComments(comments.filter(c => c.id !== commentId));
                await commentService.deleteComment(commentId, user.id);
            } catch (error) {
                console.error('Error deleting comment:', error);
                loadComments(); // Revert
            }
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const commentTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    };

    const renderComment = (comment, isReply = false) => (
        <div key={comment.id} className={`${isReply ? 'ml-8 mt-4' : 'mb-4'}`}>
            <div className="flex items-start gap-3">
                <img
                    src={comment.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`}
                    alt={comment.username}
                    className="w-8 h-8 rounded-full border border-gray-700"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium text-sm ${comment.rank > 5 ? 'text-yellow-400' : 'text-white'}`}>
                            {comment.username || 'Đạo Hữu Ẩn Danh'}
                        </span>
                        <span className="text-gray-500 text-xs">
                            {formatTimeAgo(comment.created_at)}
                        </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-4 text-xs">
                        <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="text-gray-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                        >
                            <MessageCircle size={12} />
                            Trả lời
                        </button>
                        <button
                            onClick={() => handleLikeComment(comment.id)}
                            className="text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                        >
                            <Heart size={12} fill={comment.likes > 0 ? 'currentColor' : 'none'} />
                            {comment.likes || 0}
                        </button>
                        {user && user.id === comment.user_id && (
                            <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Reply input */}
            {replyingTo === comment.id && (
                <div className="mt-3 ml-11 flex gap-3 animate-in fade-in slide-in-from-top-2">
                    <img
                        src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                        alt="Your avatar"
                        className="w-6 h-6 rounded-full"
                    />
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder={`Trả lời ${comment.username}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmitReply(comment.id)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none transition-colors"
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={submitting || !replyText.trim()}
                        className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                        <Send size={14} />
                    </button>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <MessageCircle size={24} className="text-cyan-400" />
                <h3 className="text-xl font-bold text-white">
                    Thảo Luận Cộng Đồng ({comments.length})
                </h3>
            </div>

            {/* Comment Input */}
            {user ? (
                <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                    <div className="flex gap-3">
                        <img
                            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                            alt="Your avatar"
                            className="w-10 h-10 rounded-full border border-gray-600"
                        />
                        <div className="flex-1">
                            <textarea
                                placeholder="Chia sẻ suy nghĩ của đạo hữu về bí tịch này..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 outline-none resize-none transition-colors"
                                rows={3}
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    onClick={handleSubmitComment}
                                    disabled={submitting || !newComment.trim()}
                                    className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
                                >
                                    {submitting ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Send size={14} />
                                    )}
                                    Gửi Bình Luận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-center backdrop-blur-sm">
                    <p className="text-red-400 font-medium">
                        🔒 Hãy đăng nhập để tham gia thảo luận cùng các đạo hữu khác
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length > 0 ? (
                    comments.map(comment => renderComment(comment))
                ) : (
                    <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        <MessageCircle size={48} className="text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg font-medium">Chưa có bình luận nào</p>
                        <p className="text-gray-500 text-sm">Hãy là người đầu tiên để lại dấu ấn!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentsSection;

