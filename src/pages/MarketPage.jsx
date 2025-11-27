import React, { useState, useEffect } from 'react';
import {
    ShoppingBag, Coins, Package, Zap, Shield, Crown,
    Star, ShoppingCart, Heart, Check, X, Loader, Sparkles
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { marketService } from '../lib/services';

const MarketPage = () => {
    const user = useGameStore(state => state.user);
    const setUser = useGameStore(state => state.setUser);
    const addLog = useGameStore(state => state.addLog);

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [activeCategory, setActiveCategory] = useState('pills');
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const loadMarketData = async () => {
            try {
                const allItems = await marketService.getItems();
                setItems(allItems);

                if (user?.id) {
                    const userInventory = await marketService.getUserInventory(user.id);
                    setInventory(userInventory);
                }
            } catch (error) {
                console.error('Failed to load market data:', error);
            }
        };
        loadMarketData();
    }, [user]);

    const categories = [
        { id: 'pills', label: 'Đan Dược', icon: Zap, color: 'text-yellow-400' },
        { id: 'herbs', label: 'Dược Liệu', icon: Package, color: 'text-green-400' },
        { id: 'special', label: 'Đặc Biệt', icon: Crown, color: 'text-purple-400' }
    ];

    // Filter items based on active category
    const filteredItems = items.filter(item => {
        if (activeCategory === 'pills') {
            // Show all pill types: pill_exp, pill_atk, pill_def, pill_hp, pill_spd, pill_all, pill_breakthrough, pill_special
            return item.type && item.type.startsWith('pill_');
        } else if (activeCategory === 'herbs') {
            return item.type === 'herb';
        } else if (activeCategory === 'special') {
            // Show special items and equipment
            return item.type === 'pill_special' || item.type === 'special' || item.type === 'equipment';
        }
        return false;
    });

    const handlePurchase = async (item) => {
        if (!user) {
            addLog('Vui lòng đăng nhập để mua vật phẩm', 'warning');
            return;
        }

        if (user.stones < item.price) {
            addLog('Không đủ Linh Thạch!', 'error');
            return;
        }

        setLoading(true);
        try {
            const result = await marketService.buyItem(user.id, item.id);

            // Update local user state
            setUser({ ...user, stones: result.new_balance });

            // Refresh inventory
            const updatedInventory = await marketService.getUserInventory(user.id);
            setInventory(updatedInventory);

            setSelectedItem(null);
            addLog(`Đã mua thành công ${item.name}!`, 'success');
        } catch (error) {
            console.error('Purchase error:', error);
            addLog(error.message || 'Lỗi khi mua vật phẩm', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag size={64} className="text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl text-white font-medium mb-2">Chợ Tiên Giới</h2>
                    <p className="text-gray-400 mb-4">Hãy đăng nhập để mua vật phẩm tu luyện</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a0a0a] p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                                <ShoppingBag className="text-yellow-400" size={40} />
                                Chợ Tiên Giới
                            </h1>
                            <p className="text-gray-400">Trao đổi Linh Thạch để nâng cấp thực lực</p>
                        </div>

                        <div className="flex items-center gap-6 bg-gray-800/50 px-6 py-4 rounded-xl border border-gray-600">
                            <div className="flex items-center gap-3">
                                <Coins className="text-yellow-400" size={24} />
                                <div>
                                    <div className="text-yellow-400 font-bold text-xl">{user.stones.toLocaleString()}</div>
                                    <div className="text-gray-400 text-sm">Linh Thạch</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all font-medium ${activeCategory === cat.id
                                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                <Icon size={20} className={activeCategory === cat.id ? 'text-white' : cat.color} />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-cyan-500/50 transition-all hover-lift group cursor-pointer"
                            onClick={() => setSelectedItem(item)}
                        >
                            <div className="text-center mb-4">
                                <div className="text-4xl mb-3">{item.icon}</div>
                                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">
                                    {item.name}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {item.description || item.desc}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Coins size={16} className="text-yellow-400" />
                                    <span className="text-yellow-400 font-bold">{item.price}</span>
                                </div>
                                <Sparkles size={16} className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-xl p-6 border border-purple-500/20">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Star className="text-yellow-400" />
                        Thông Kê Sở Hữu
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-black/30 rounded-lg p-4 text-center">
                            <Package className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <div className="text-blue-400 font-bold text-xl">{inventory.length}</div>
                            <div className="text-gray-400 text-sm">Vật Phẩm</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-4 text-center">
                            <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <div className="text-green-400 font-bold text-xl">0</div>
                            <div className="text-gray-400 text-sm">Đã Sử Dụng</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-4 text-center">
                            <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                            <div className="text-red-400 font-bold text-xl">{user.stones}</div>
                            <div className="text-gray-400 text-sm">Tổng Chi Tiêu</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-4 text-center">
                            <Crown className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                            <div className="text-purple-400 font-bold text-xl">-</div>
                            <div className="text-gray-400 text-sm">Đặc Quyền</div>
                        </div>
                    </div>
                </div>

                {/* Purchase Modal */}
                {selectedItem && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">{selectedItem.icon}</div>
                                <h3 className="text-2xl font-bold text-white mb-2">{selectedItem.name}</h3>
                                <p className="text-gray-400">{selectedItem.description || selectedItem.desc}</p>
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <Coins size={20} className="text-yellow-400" />
                                    <span className="text-yellow-400 text-xl font-bold">{selectedItem.price}</span>
                                    <span className="text-gray-400">Linh Thạch</span>
                                </div>
                            </div>

                            {user.stones < selectedItem.price ? (
                                <div className="text-center">
                                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
                                        <p className="text-red-400">Không đủ Linh Thạch!</p>
                                        <p className="text-gray-400 text-sm mt-1">Xem thêm phim để kiếm EXP!</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedItem(null)}
                                            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg transition-colors"
                                        >
                                            Đóng
                                        </button>
                                        <button
                                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-3 rounded-lg transition-colors"
                                            onClick={() => {
                                                setSelectedItem(null);
                                                window.location.href = '/';
                                            }}
                                        >
                                            Xem Phim
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={() => handlePurchase(selectedItem)}
                                        disabled={loading}
                                        className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader size={18} className="animate-spin" />
                                                Đang mua...
                                            </>
                                        ) : (
                                            <>
                                                <Check size={18} />
                                                Mua Ngay
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketPage;
