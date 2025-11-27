import React, { useState, useEffect } from 'react';
import { Flame, BookOpen, History, Sparkles, Check, X, AlertCircle, Trophy } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { alchemyService } from '../lib/services/alchemyService';
import toast, { Toaster } from 'react-hot-toast';

const AlchemyPage = () => {
    const user = useGameStore(state => state.user);
    const [activeTab, setActiveTab] = useState('furnace');
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [recipeDetails, setRecipeDetails] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [crafting, setCrafting] = useState(false);
    const [showQTE, setShowQTE] = useState(false);
    const [qteScore, setQteScore] = useState(0);

    useEffect(() => {
        if (user) {
            loadRecipes();
            loadHistory();
        }
    }, [user]);

    const loadRecipes = async () => {
        try {
            const data = await alchemyService.getRecipes(user.id);
            setRecipes(data.recipes);
        } catch (error) {
            console.error('Failed to load recipes:', error);
        }
    };

    const loadHistory = async () => {
        try {
            const data = await alchemyService.getCraftingHistory(user.id, 20);
            setHistory(data.history);
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    };

    const selectRecipe = async (recipe) => {
        setSelectedRecipe(recipe);
        setLoading(true);
        try {
            const details = await alchemyService.getRecipeDetails(recipe.id, user.id);
            setRecipeDetails(details);
        } catch (error) {
            toast.error('Không thể tải công thức');
        } finally {
            setLoading(false);
        }
    };

    const startCrafting = () => {
        if (!recipeDetails?.can_craft) {
            toast.error('Không đủ nguyên liệu!');
            return;
        }
        setShowQTE(true);
    };

    const onQTEComplete = async (score) => {
        setQteScore(score);
        setShowQTE(false);
        setCrafting(true);

        try {
            const result = await alchemyService.craftPill(user.id, selectedRecipe.id, score);

            if (result.success) {
                toast.success(
                    `🎉 ${result.message} \nChất lượng: ${result.quality} (${result.quality_multiplier}x)`,
                    { duration: 5000 }
                );
            } else {
                toast.error(result.message);
            }

            // Reload data
            loadRecipes();
            loadHistory();
            selectRecipe(selectedRecipe); // Refresh details
        } catch (error) {
            toast.error(error.message || 'Luyện đan thất bại!');
        } finally {
            setCrafting(false);
        }
    };

    const tabs = [
        { id: 'furnace', label: 'Lò Luyện Đan', icon: Flame },
        { id: 'recipes', label: 'Sổ Công Thức', icon: BookOpen },
        { id: 'history', label: 'Lịch Sử', icon: History }
    ];

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <Flame size={64} className="text-orange-600 mx-auto mb-4" />
                    <h2 className="text-xl text-white font-medium mb-2">Yêu cầu đăng nhập</h2>
                    <p className="text-gray-400">Hãy đăng nhập để luyện đan</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a0a0a] p-8">
            <Toaster />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <Flame className="text-orange-500" size={40} />
                        Hệ Thống Luyện Đan
                    </h1>
                    <p className="text-gray-400">Luyện đan dược, tạo kỳ bảo, minh tâm kiến tánh</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${activeTab === tab.id
                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                <Icon size={20} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                {activeTab === 'furnace' && (
                    <FurnaceView
                        recipes={recipes}
                        selectedRecipe={selectedRecipe}
                        recipeDetails={recipeDetails}
                        onSelectRecipe={selectRecipe}
                        onStartCraft={startCrafting}
                        loading={loading}
                        crafting={crafting}
                    />
                )}

                {activeTab === 'recipes' && (
                    <RecipesView recipes={recipes} onSelectRecipe={selectRecipe} />
                )}

                {activeTab === 'history' && (
                    <HistoryView history={history} />
                )}
            </div>

            {/* QTE Mini-Game Modal */}
            {showQTE && (
                <QTEMiniGame
                    onComplete={onQTEComplete}
                    onCancel={() => setShowQTE(false)}
                />
            )}
        </div>
    );
};

// Furnace View Component
const FurnaceView = ({ recipes, selectedRecipe, recipeDetails, onSelectRecipe, onStartCraft, loading, crafting }) => {
    const unlockedRecipes = recipes.filter(r => r.unlocked);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recipe Selector */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Chọn Công Thức</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {unlockedRecipes.map(recipe => (
                        <button
                            key={recipe.id}
                            onClick={() => onSelectRecipe(recipe)}
                            className={`w-full text-left p-4 rounded-lg transition-all ${selectedRecipe?.id === recipe.id
                                ? 'bg-orange-600 border-orange-500'
                                : 'bg-gray-800 hover:bg-gray-700 border-transparent'
                                } border`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">{recipe.icon_url}</div>
                                <div className="flex-1">
                                    <div className="text-white font-bold">{recipe.name}</div>
                                    <div className="text-gray-400 text-sm">{recipe.description}</div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${{ common: 'bg-gray-600', uncommon: 'bg-green-600', rare: 'bg-blue-600', epic: 'bg-purple-600', legendary: 'bg-yellow-600' }[recipe.rarity]
                                    }`}>
                                    {recipe.rarity}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Furnace Details */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    </div>
                ) : selectedRecipe ? (
                    <>
                        <h3 className="text-2xl font-bold text-white mb-4">{selectedRecipe.name}</h3>

                        {/* Ingredients */}
                        <div className="mb-6">
                            <h4 className="text-lg font-bold text-white mb-3">Nguyên Liệu Cần:</h4>
                            <div className="space-y-2">
                                {recipeDetails?.ingredients?.map((ing, i) => {
                                    const userQty = (recipeDetails?.user_inventory || {})[ing.herb_id] || 0;
                                    const hasEnough = userQty >= ing.quantity;
                                    return (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{ing.herb_icon || '🌿'}</span>
                                                <span className="text-white">{ing.herb_name}</span>
                                            </div>
                                            <div className={`font-bold ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                                                {userQty}/{ing.quantity}
                                                {hasEnough ? <Check size={16} className="inline ml-1" /> : <X size={16} className="inline ml-1" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Success Rate */}
                        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/20 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-white">Tỷ Lệ Cơ Bản:</span>
                                <span className="text-blue-400 font-bold">{recipeDetails?.base_success_rate}%</span>
                            </div>
                        </div>

                        {/* Craft Button */}
                        <button
                            onClick={onStartCraft}
                            disabled={!recipeDetails?.can_craft || crafting}
                            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {crafting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Đang Luyện...
                                </>
                            ) : (
                                <>
                                    <Flame size={20} />
                                    Bắt Đầu Luyện Đan
                                </>
                            )}
                        </button>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <AlertCircle className="text-gray-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-400">Chọn một công thức để bắt đầu</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Recipes View Component
const RecipesView = ({ recipes, onSelectRecipe }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => (
                <div
                    key={recipe.id}
                    className={`bg-white/5 backdrop-blur-sm border rounded-xl p-6 ${recipe.unlocked
                        ? 'border-white/10 hover:border-orange-500/50 cursor-pointer'
                        : 'border-gray-700 opacity-50'
                        } transition-all`}
                    onClick={() => recipe.unlocked && onSelectRecipe(recipe)}
                >
                    <div className="text-center mb-4">
                        <div className="text-5xl mb-3">{recipe.icon_url}</div>
                        <h3 className="text-white font-bold text-lg">{recipe.name}</h3>
                        <p className="text-gray-400 text-sm">{recipe.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${{ common: 'bg-gray-600', uncommon: 'bg-green-600', rare: 'bg-blue-600', epic: 'bg-purple-600', legendary: 'bg-yellow-600' }[recipe.rarity]
                            }`}>
                            {recipe.rarity}
                        </span>
                        {!recipe.unlocked && (
                            <span className="text-red-400 text-sm">Rank {recipe.required_rank}+</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// History View Component
const HistoryView = ({ history }) => {
    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Lịch Sử Luyện Đan</h3>
            <div className="space-y-2">
                {history.map((record, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{record.pill_icon}</span>
                            <div>
                                <div className="text-white font-bold">{record.pill_name}</div>
                                <div className="text-gray-400 text-sm">
                                    QTE: {record.qte_score} | EXP: +{record.exp_gained}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            {record.success ? (
                                <div className="text-green-400 font-bold">
                                    ✓ {record.quality}
                                </div>
                            ) : (
                                <div className="text-red-400 font-bold">✗ Thất Bại</div>
                            )}
                            <div className="text-gray-500 text-xs">
                                {new Date(record.crafted_at).toLocaleString('vi-VN')}
                            </div>
                        </div>
                    </div>
                ))}
                {history.length === 0 && (
                    <div className="text-center py-12">
                        <History className="text-gray-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-400">Chưa có lịch sử luyện đan</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// QTE Mini-Game Component
const QTEMiniGame = ({ onComplete, onCancel }) => {
    const [fireLevel, setFireLevel] = useState(50);
    const [score, setScore] = useState(50);
    const [showButton, setShowButton] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [buttonClicks, setButtonClicks] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        // Fire oscillation
        const fireInterval = setInterval(() => {
            setFireLevel(prev => {
                const change = (Math.random() - 0.5) * 10;
                return Math.max(0, Math.min(100, prev + change));
            });
        }, 200);

        // Random button prompts
        const buttonInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                setShowButton(true);
                setTimeout(() => setShowButton(false), 1500);
            }
        }, 3000);

        // Timer
        const timerInterval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(fireInterval);
            clearInterval(buttonInterval);
            clearInterval(timerInterval);
        };
    }, []);

    useEffect(() => {
        if (gameOver) {
            const finalScore = Math.min(100, Math.max(0, score + (buttonClicks * 5)));
            setTimeout(() => onComplete(finalScore), 1000);
        }
    }, [gameOver]);

    const handleButtonClick = () => {
        if (showButton) {
            setScore(prev => Math.min(100, prev + 10));
            setButtonClicks(prev => prev + 1);
            setShowButton(false);
        }
    };

    const inSweetSpot = fireLevel >= 40 && fireLevel <= 60;

    useEffect(() => {
        const scoreInterval = setInterval(() => {
            setScore(prev => {
                if (inSweetSpot) {
                    return Math.min(100, prev + 0.5);
                } else {
                    return Math.max(0, prev - 0.3);
                }
            });
        }, 100);

        return () => clearInterval(scoreInterval);
    }, [inSweetSpot]);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-orange-500 rounded-xl p-8 w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    🔥 Điều Chỉnh Lửa Đan
                </h2>

                {/* Timer */}
                <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-orange-400">{timeLeft}s</div>
                </div>

                {/* Fire Meter */}
                <div className="mb-6">
                    <div className="text-white text-sm mb-2">Lửa Đan: {Math.round(fireLevel)}%</div>
                    <div className="w-full h-8 bg-gray-800 rounded-full overflow-hidden relative">
                        <div
                            className={`h-full transition-all ${inSweetSpot ? 'bg-green-500' : 'bg-orange-500'}`}
                            style={{ width: `${fireLevel}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-1/5 h-full bg-green-500/30 border-x-2 border-green-500"></div>
                        </div>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">Giữ lửa trong vùng xanh (40-60%)</div>
                </div>

                {/* Score */}
                <div className="mb-6">
                    <div className="text-white text-sm mb-2">Điểm Số: {Math.round(score)}/100</div>
                    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                            style={{ width: `${score}%` }}
                        />
                    </div>
                </div>

                {/* Button Prompt */}
                {showButton && (
                    <div className="mb-6 text-center animate-pulse">
                        <button
                            onClick={handleButtonClick}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-lg font-bold text-xl"
                        >
                            ⚡ CLICK NGAY!
                        </button>
                    </div>
                )}

                {/* Cancel */}
                <button
                    onClick={onCancel}
                    className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition-colors"
                >
                    Hủy
                </button>
            </div>
        </div>
    );
};

export default AlchemyPage;
