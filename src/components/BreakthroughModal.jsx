
import React, { useState } from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

const BreakthroughModal = ({ onClose }) => {
    const { attemptBreakthrough, user } = useGameStore();
    const [status, setStatus] = useState('idle'); // idle, processing, success, fail
    const [message, setMessage] = useState('');

    const handleBreakthrough = async () => {
        setStatus('processing');
        try {
            // Fake delay for suspense
            await new Promise(resolve => setTimeout(resolve, 2000));

            const result = await attemptBreakthrough();

            if (result.result === 1) {
                setStatus('success');
                setMessage(result.message);
            } else {
                setStatus('fail');
                setMessage(result.message);
            }
        } catch (error) {
            setStatus('error');
            setMessage('Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-yellow-600/50 rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">

                {/* Background Effects */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>

                {status === 'idle' && (
                    <div className="relative z-10">
                        <div className="w-24 h-24 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center animate-pulse border-4 border-yellow-500">
                            <Zap size={48} className="text-yellow-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-yellow-400 mb-2 uppercase tracking-wider">Độ Kiếp</h2>
                        <p className="text-gray-300 mb-6">
                            Đạo hữu đã đạt tới bình cảnh. Có muốn mạo hiểm đột phá cảnh giới tiếp theo?
                        </p>
                        <div className="bg-gray-800 p-4 rounded-lg mb-6 text-sm text-left border border-gray-700">
                            <p className="text-green-400 flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Thành công: Thăng cấp, hồi phục 100% trạng thái.
                            </p>
                            <p className="text-red-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Thất bại: Tẩu hỏa nhập ma, mất 30% tu vi.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold">
                                Để sau
                            </button>
                            <button onClick={handleBreakthrough} className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-500 hover:to-red-500 text-white rounded-lg font-bold shadow-lg shadow-yellow-900/50">
                                Đột Phá Ngay
                            </button>
                        </div>
                    </div>
                )}

                {status === 'processing' && (
                    <div className="relative z-10 py-10">
                        <div className="w-32 h-32 mx-auto mb-6 relative">
                            <div className="absolute inset-0 border-4 border-t-yellow-500 border-r-transparent border-b-red-500 border-l-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-2 border-4 border-t-transparent border-r-cyan-500 border-b-transparent border-l-yellow-500 rounded-full animate-spin-reverse"></div>
                            <Zap size={48} className="absolute inset-0 m-auto text-white animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-bold text-white animate-pulse">Đang Độ Kiếp...</h3>
                        <p className="text-yellow-500 mt-2">Thiên lôi đang giáng xuống!</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="relative z-10">
                        <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500">
                            <Zap size={48} className="text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-green-400 mb-4">Thành Công!</h2>
                        <p className="text-gray-300 mb-8">{message}</p>
                        <button onClick={onClose} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold">
                            Tiếp tục tu luyện
                        </button>
                    </div>
                )}

                {status === 'fail' && (
                    <div className="relative z-10">
                        <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-500">
                            <AlertTriangle size={48} className="text-red-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-red-500 mb-4">Thất Bại!</h2>
                        <p className="text-gray-300 mb-8">{message}</p>
                        <button onClick={onClose} className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold">
                            Hồi sức
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BreakthroughModal;
