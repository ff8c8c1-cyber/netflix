import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Gift, Zap } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const VIPPage = () => {
    const [user, setUser] = useState(null);
    const [vipStatus, setVipStatus] = useState('none');
    const [expiresAt, setExpiresAt] = useState(null);
    const [lastClaim, setLastClaim] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            fetchVipStatus(u.id);
        }
    }, []);

    const fetchVipStatus = async (userId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/vip/status/${userId}`);
            const data = await res.json();
            setVipStatus(data.vipStatus || 'none');
            setExpiresAt(data.expiresAt);
            setLastClaim(data.lastClaim);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (vipType) => {
        if (!user) return;

        const costs = { monthly: 200, lifetime: 2000 };
        const cost = costs[vipType];

        if (!confirm(`Mua VIP ${vipType === 'monthly' ? 'Tháng' : 'Vĩnh Viễn'} với ${cost} Đá Linh Thạch?`)) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/vip/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, vipType })
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                setVipStatus(data.vipStatus);
                setExpiresAt(data.expiresAt);
                // Refresh user data
                fetchVipStatus(user.id);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi khi mua VIP');
        }
    };

    const handleDailyClaim = async () => {
        if (!user) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/vip/daily-claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`✅ ${data.message}\n+${data.amount} Đá Linh Thạch!`);
                setLastClaim(new Date().toISOString());
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi khi nhận đá');
        }
    };

    const benefits = {
        monthly: [
            { icon: <Zap className="text-yellow-400" />, text: '+50% EXP từ mọi nguồn' },
            { icon: <Gift className="text-blue-400" />, text: 'Nhận 100 Đá mỗi ngày' },
            { icon: <Sparkles className="text-purple-400" />, text: 'Giảm 10% giá shop' },
            { icon: <Crown className="text-yellow-400" />, text: 'Tên vàng sang trọng' },
        ],
        lifetime: [
            { icon: <Zap className="text-orange-400" />, text: '+100% EXP (2x)' },
            { icon: <Gift className="text-purple-400" />, text: 'Nhận 200 Đá mỗi ngày' },
            { icon: <Sparkles className="text-pink-400" />, text: 'Giảm 20% giá shop' },
            { icon: <Crown className="text-purple-400" />, text: 'Tên kim cương độc quyền' },
            { icon: <Sparkles className="text-blue-400" />, text: 'Linh thú VIP độc quyền' },
            { icon: <Crown className="text-yellow-400" />, text: 'Tất cả quyền lợi VIP Tháng' },
        ]
    };

    if (loading) {
        return <div className="text-white p-8">Đang tải...</div>;
    }

    const canClaim = () => {
        if (!lastClaim) return true;
        const hoursSince = (new Date() - new Date(lastClaim)) / (1000 * 60 * 60);
        return hoursSince >= 24;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a0a0a] p-4 md:p-8 ml-0 md:ml-64">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-4">
                    <Crown size={48} className="text-yellow-400" />
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400">
                        VIP MEMBERSHIP
                    </h1>
                    <Crown size={48} className="text-purple-400" />
                </div>
                <p className="text-gray-400 text-lg">Trở thành VIP - Tăng tốc tu luyện, nhận đặc quyền độc quyền!</p>
            </div>

            {/* Current Status */}
            {vipStatus !== 'none' && (
                <div className="bg-gradient-to-r from-yellow-900/20 to-purple-900/20 border border-yellow-500/30 rounded-2xl p-8 mb-12">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <Crown size={32} className={vipStatus === 'lifetime' ? 'text-purple-400' : 'text-yellow-400'} />
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Trạng Thái: {vipStatus === 'lifetime' ? 'VIP Vĩnh Viễn' : 'VIP Tháng'}
                                </h2>
                                {expiresAt && (
                                    <p className="text-gray-400">
                                        Hết hạn: {new Date(expiresAt).toLocaleDateString('vi-VN')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleDailyClaim}
                            disabled={!canClaim()}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${canClaim()
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {canClaim() ? '🎁 Nhận Đá Hàng Ngày' : '✓ Đã Nhận Hôm Nay'}
                        </button>
                    </div>
                </div>
            )}

            {/* VIP Tiers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* VIP Monthly */}
                <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-2 border-yellow-500/50 rounded-3xl p-8 relative overflow-hidden group hover:scale-105 transition-transform">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <Crown size={40} className="text-yellow-400" />
                            <div>
                                <h3 className="text-3xl font-black text-yellow-400">VIP Tháng</h3>
                                <p className="text-gray-400">30 ngày quyền lợi đặc biệt</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="text-5xl font-black text-white mb-2">200</div>
                            <div className="text-gray-400">Đá Linh Thạch</div>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {benefits.monthly.map((benefit, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    {benefit.icon}
                                    <span className="text-white">{benefit.text}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handlePurchase('monthly')}
                            disabled={vipStatus !== 'none'}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${vipStatus === 'none'
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {vipStatus === 'monthly' ? '✓ Đang Sử Dụng' : vipStatus === 'lifetime' ? 'Đã Có VIP Vĩnh Viễn' : 'Mua Ngay'}
                        </button>
                    </div>
                </div>

                {/* VIP Lifetime */}
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-500/50 rounded-3xl p-8 relative overflow-hidden group hover:scale-105 transition-transform">
                    <div className="absolute -top-4 -right-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold rotate-12">
                        BEST VALUE!
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <Crown size={40} className="text-purple-400" />
                            <div>
                                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                    VIP Vĩnh Viễn
                                </h3>
                                <p className="text-gray-400">Trọn đời quyền lợi tối đa</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="text-5xl font-black text-white mb-2">2000</div>
                            <div className="text-gray-400">Đá Linh Thạch</div>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {benefits.lifetime.map((benefit, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    {benefit.icon}
                                    <span className="text-white">{benefit.text}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handlePurchase('lifetime')}
                            disabled={vipStatus === 'lifetime'}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${vipStatus !== 'lifetime'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {vipStatus === 'lifetime' ? '✓ Đang Sử Dụng' : 'Mua Ngay'}
                        </button>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="max-w-4xl mx-auto mt-16 bg-white/5 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Câu Hỏi Thường Gặp</h3>
                <div className="space-y-4 text-gray-300">
                    <div>
                        <p className="font-bold text-white">❓ VIP có tự động gia hạn không?</p>
                        <p>Không. VIP Tháng hết hạn sau 30 ngày và cần mua lại. VIP Vĩnh Viễn không hết hạn.</p>
                    </div>
                    <div>
                        <p className="font-bold text-white">❓ Đã có VIP Tháng, mua Vĩnh Viễn thì sao?</p>
                        <p>VIP Vĩnh Viễn sẽ thay thế VIP Tháng ngay lập tức.</p>
                    </div>
                    <div>
                        <p className="font-bold text-white">❓ Quyền lợi có áp dụng ngay không?</p>
                        <p>Có! Ngay sau khi mua, bạn nhận 2x EXP và có thể claim Đá hàng ngày.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VIPPage;
