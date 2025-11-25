import React, { useState } from 'react';
import { Loader, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function ItemInventory({ userId, onItemUsed }) {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usingItemId, setUsingItemId] = useState(null);

    React.useEffect(() => {
        fetchInventory();
    }, [userId]);

    const fetchInventory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/inventory`);
            const data = await response.json();
            setInventory(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setLoading(false);
        }
    };

    const handleUseItem = async (item) => {
        if (usingItemId) return; // Prevent double click

        setUsingItemId(item.id);

        try {
            const response = await fetch(`${API_BASE_URL}/api/items/use`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    itemId: item.id,
                    quantity: 1
                })
            });

            const data = await response.json();

            if (data.success) {
                // Show success message
                if (onItemUsed) {
                    onItemUsed(data.effect.message);
                }

                // Refresh inventory
                await fetchInventory();
            } else {
                alert(data.message || 'Failed to use item');
            }
        } catch (error) {
            console.error('Error using item:', error);
            alert('Error using item');
        } finally {
            setUsingItemId(null);
        }
    };

    if (loading) {
        return <div className="text-gray-400 text-center py-8">Loading inventory...</div>;
    }

    if (inventory.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 mb-2">Không có vật phẩm nào</div>
                <div className="text-gray-500 text-sm">Mua vật phẩm từ Vạn Bảo Lâu</div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {inventory.map((item) => (
                <div
                    key={item.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
                >
                    {/* Item Icon/Image */}
                    <div className="aspect-square bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-lg mb-3 flex items-center justify-center">
                        {item.iconUrl ? (
                            <img src={item.iconUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <div className="text-4xl">{getItemEmoji(item.type)}</div>
                        )}
                    </div>

                    {/* Item Name */}
                    <h4 className="text-white font-medium text-sm mb-1 truncate">{item.name}</h4>

                    {/* Quantity */}
                    <p className="text-gray-400 text-xs mb-3">x{item.quantity}</p>

                    {/* Use Button */}
                    <button
                        onClick={() => handleUseItem(item)}
                        disabled={usingItemId === item.id}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${usingItemId === item.id
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                            }`}
                    >
                        {usingItemId === item.id ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader className="animate-spin" size={14} />
                                Using...
                            </span>
                        ) : (
                            'Use'
                        )}
                    </button>
                </div>
            ))}
        </div>
    );
}

//Helper function for item emojis
function getItemEmoji(type) {
    const emojiMap = {
        pill_exp: '💊',
        pill_hp: '❤️',
        pill_atk: '⚔️',
        pill_def: '🛡️',
        pill_spd: '⚡',
        equipment: '⚒️',
        pet_egg: '🥚',
    };
    return emojiMap[type] || '📦';
}
