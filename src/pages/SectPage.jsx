import React, { useState, useEffect } from 'react';
import { Users, Shield, Book, Zap, Database, Crown, Star, Map, Activity } from 'lucide-react';

import SectMap from '../components/SectMap';

import { API_BASE_URL } from '../config/api';

const SectPage = () => {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('loading'); // loading, lobby, dashboard
    const [sects, setSects] = useState([]);
    const [mySectData, setMySectData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, members, facilities, missions, shop
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', description: '' });
    const [shopItems, setShopItems] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [userStones, setUserStones] = useState(0);
    const [missions, setMissions] = useState([]);
    const [skills, setSkills] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [blackMarketItems, setBlackMarketItems] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            checkMySect(u.id);
            fetchUserStones(u.id);
        }
    }, []);

    const checkMySect = async (userId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/my?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setMySectData(data);
                setView('dashboard');
            } else {
                setView('lobby');
                fetchSects();
            }
        } catch (err) {
            console.error(err);
            setView('lobby');
            fetchSects();
        }
    };

    const fetchSects = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects`);
            const data = await res.json();
            setSects(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUserStones = async (userId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
            const data = await res.json();
            setUserStones(data.stones || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectBuilding = (type) => {
        if (type === 'MainHall') {
            setActiveTab('overview');
        } else if (type === 'Pavilion') {
            setActiveTab('pavilion');
        } else if (type === 'Alchemy') {
            setActiveTab('facilities');
        } else if (type === 'Vein') {
            setActiveTab('facilities');
        } else if (type === 'Mission') {
            setActiveTab('missions');
        }
    };

    const handleJoinSect = async (sectId) => {
        if (!user) return alert('Vui lòng đăng nhập!');
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, sectId })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Gia nhập tông môn thành công!');
                checkMySect(user.id);
            } else {
                alert(data.message || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối!');
        }
    };

    const handleCreateSect = async () => {
        if (!user) return alert('Vui lòng đăng nhập!');
        if (!createForm.name.trim()) return alert('Vui lòng nhập tên tông môn!');
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    name: createForm.name,
                    description: createForm.description
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Lập tông thành công!');
                setShowCreateModal(false);
                checkMySect(user.id);
            } else {
                alert(data.message || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối!');
        }
    };

    const handleContribute = async (amount) => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/contribute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, amount })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Đóng góp thành công ${amount} Linh Thạch!`);
                checkMySect(user.id);
                fetchUserStones(user.id);
            } else {
                alert(data.message || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối!');
        }
    };

    const handleClaimSalary = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/salary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Nhận lương thành công! +${data.stones} Đá, +${data.contribution} Cống Hiến`);
                checkMySect(user.id);
                fetchUserStones(user.id);
            } else {
                alert(data.message || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối!');
        }
    };

    const handleClaimVein = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/claim-vein`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Thu hoạch thành công! +${data.stones} Đá, +${data.exp} EXP`);
                checkMySect(user.id);
            } else {
                alert(data.message || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối!');
        }
    };

    const handleUpgrade = async (buildingType) => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/upgrade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, buildingType })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Nâng cấp thành công! Cấp mới: ${data.newLevel}`);
                checkMySect(user.id);
            } else {
                alert(data.message || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối!');
        }
    };

    const handleManageMember = async (targetUserId, action) => {
        if (!user) return;
        const confirmMsg = action === 'kick' ? 'Bạn có chắc muốn trục xuất thành viên này?' :
            action === 'promote' ? 'Thăng chức cho thành viên này?' :
                'Giáng chức thành viên này?';
        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/manage-member`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, targetUserId, action })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Thao tác thành công!');
                checkMySect(user.id);
            } else {
                alert(data.message || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối!');
        }
    };

    const handleClaimMission = async (missionId) => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/missions/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, missionId })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Nhận thưởng thành công! +${data.contribution} Cống Hiến, +${data.exp} EXP`);
                fetchMissions();
                checkMySect(user.id);
            } else {
                alert(data.message || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối!');
        }
    };

    const fetchMissions = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/missions?userId=${user.id}`);
            const data = await res.json();
            setMissions(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLearnSkill = async (skillId) => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/skills/learn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, skillId })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Học kỹ năng thành công!');
                fetchSkills();
                checkMySect(user.id);
            } else {
                alert(data.message || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối!');
        }
    };

    const fetchSkills = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/skills?userId=${user.id}`);
            const data = await res.json();
            setSkills(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBuyItem = async (shopItemId) => {
        if (!user) return;
        const quantity = 1;
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/shop/buy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, shopItemId, quantity })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Mua vật phẩm thành công!');
                fetchShopAndInventory();
                checkMySect(user.id);
            } else {
                alert(data.message || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối!');
        }
    };

    const fetchShopAndInventory = async () => {
        if (!user || !mySectData?.sect?.Id) return;
        try {
            const [shopRes, invRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/sects/shop?sectId=${mySectData.sect.Id}`),
                fetch(`${API_BASE_URL}/api/sects/inventory?userId=${user.id}`)
            ]);
            const shopData = await shopRes.json();
            const invData = await invRes.json();
            setShopItems(shopData);
            setInventory(invData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBid = async (auctionId, currentBid) => {
        if (!user) return;
        const bidAmount = prompt(`Nhập số tiền đấu giá (hiện tại: ${currentBid}):`);
        if (!bidAmount || isNaN(bidAmount)) return;
        const amount = parseInt(bidAmount);
        if (amount <= currentBid) return alert('Giá đấu phải cao hơn giá hiện tại!');

        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/auction/bid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, auctionId, bidAmount: amount })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Đấu giá thành công!');
                fetchAuctions();
                fetchUserStones(user.id);
            } else {
                alert(data.message || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối!');
        }
    };

    const fetchAuctions = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/sects/auction`);
            const data = await res.json();
            setAuctions(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBuyBlackMarket = async (itemId, price) => {
        if (!user) return;
        if (!confirm(`Mua vật phẩm với giá ${price} Linh Thạch?`)) return;

        try {
            // Black market would need a separate endpoint - for now use placeholder
            alert('Tính năng chợ đen đang được phát triển!');
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối!');
        }
    };

    // Load additional data when in dashboard view
    useEffect(() => {
        if (view === 'dashboard' && user) {
            if (activeTab === 'missions') fetchMissions();
            if (activeTab === 'pavilion') fetchSkills();
            if (activeTab === 'shop') fetchShopAndInventory();
            if (activeTab === 'auction') fetchAuctions();
        }
    }, [activeTab, view, user]);


    if (view === 'loading') return <div className="text-white p-8">Đang tải dữ liệu Tông Môn...</div>;

    // --- LOBBY VIEW ---
    if (view === 'lobby') {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8 ml-64">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        Danh Sách Tông Môn
                    </h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Crown size={20} /> Lập Tông (1000 Đá)
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sects.map(sect => (
                        <div key={sect.Id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 bg-blue-600 rounded-bl-xl font-bold text-xs">
                                Lv.{sect.Level}
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-blue-300">{sect.Name}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{sect.Description}</p>
                            <div className="flex justify-between text-gray-300 mb-4 bg-gray-900/50 p-3 rounded">
                                <span className="flex items-center gap-1"><Crown size={14} className="text-yellow-500" /> {sect.LeaderName}</span>
                                <span className="flex items-center gap-1"><Users size={14} className="text-blue-400" /> {sect.MemberCount} TV</span>
                            </div>
                            <button
                                onClick={() => handleJoinSect(sect.Id)}
                                className="w-full py-2 bg-gray-700 hover:bg-blue-600 rounded font-bold transition-colors"
                            >
                                Xin Gia Nhập
                            </button>
                        </div>
                    ))}
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md border border-gray-600">
                            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Khai Tông Lập Phái</h2>
                            <input
                                type="text"
                                placeholder="Tên Tông Môn"
                                className="w-full bg-gray-900 p-3 rounded mb-4 border border-gray-700 text-white"
                                value={createForm.name}
                                onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                            />
                            <textarea
                                placeholder="Tôn Chỉ / Mô Tả"
                                className="w-full bg-gray-900 p-3 rounded mb-6 border border-gray-700 text-white h-32"
                                value={createForm.description}
                                onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                            />
                            <div className="flex gap-4">
                                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-gray-700 rounded hover:bg-gray-600">Hủy</button>
                                <button onClick={handleCreateSect} className="flex-1 py-3 bg-yellow-600 rounded hover:bg-yellow-500 font-bold">Tạo (1000 Đá)</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- DASHBOARD VIEW ---
    const { sect, member, members, buildings } = mySectData;
    const isLeader = member.Role === 'Leader' || member.Role === 'Elder';

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 ml-64">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 mb-8 border border-gray-700 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                            {sect.Name}
                        </h1>
                        <p className="text-gray-400 max-w-2xl italic">"{sect.Description}"</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-yellow-400 mb-1">Lv.{sect.Level}</div>
                        <div className="flex items-center gap-2 justify-end text-gray-300 bg-black/30 px-4 py-1 rounded-full">
                            <Database size={16} className="text-blue-400" />
                            <span>Tài Nguyên: {sect.Resources}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAP VIEW */}
            <div className="mb-8">
                <SectMap buildings={buildings} onSelectBuilding={handleSelectBuilding} />
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mb-8 border-b border-gray-700 pb-1 overflow-x-auto">
                {[
                    { id: 'overview', icon: Activity, label: 'Tổng Quan' },
                    { id: 'members', icon: Users, label: 'Thành Viên' },
                    { id: 'facilities', icon: Map, label: 'Kiến Trúc' },
                    { id: 'missions', icon: Book, label: 'Nhiệm Vụ' },
                    { id: 'pavilion', icon: Book, label: 'Tàng Kinh Các' },
                    { id: 'shop', icon: Database, label: 'Tàng Bảo Các' },
                    { id: 'auction', icon: Star, label: 'Đấu Giá' },
                    { id: 'blackmarket', icon: Zap, label: 'Chợ Đen' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 flex items-center gap-2 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <tab.icon size={20} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-gray-800/50 rounded-xl p-6 min-h-[500px]">

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h3 className="text-xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
                                <Crown size={20} /> Thông Tin Cá Nhân
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Vai Trò:</span>
                                    <span className="font-bold text-white">{member.Role}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Cống Hiến:</span>
                                    <span className="font-bold text-green-400">{member.Contribution}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Gia Nhập:</span>
                                    <span className="text-gray-300">{new Date(member.JoinedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <h4 className="font-bold mb-3 text-gray-300 flex justify-between">
                                    <span>Đóng Góp Tài Nguyên</span>
                                    <span className="text-yellow-400 text-sm">Hiện có: {userStones} Linh Thạch</span>
                                </h4>
                                <div className="flex gap-2 mb-4">
                                    <button onClick={() => handleContribute(100)} className="flex-1 py-2 bg-gray-700 hover:bg-green-700 rounded text-sm font-bold">
                                        100 Đá
                                    </button>
                                    <button onClick={() => handleContribute(1000)} className="flex-1 py-2 bg-gray-700 hover:bg-green-600 rounded text-sm font-bold">
                                        1000 Đá
                                    </button>
                                </div>

                                <h4 className="font-bold mb-3 text-gray-300">Lương Bổng Hàng Ngày</h4>
                                <div className="bg-black/20 p-3 rounded flex justify-between items-center">
                                    <div className="text-sm">
                                        <div className="text-gray-400">Vai trò: <span className="text-white font-bold">{member.Role}</span></div>
                                        <div className="text-yellow-400 text-xs mt-1">
                                            {member.Role === 'Leader' ? '500 Đá + 100 Cống Hiến' :
                                                member.Role === 'Elder' ? '300 Đá + 50 Cống Hiến' :
                                                    member.Role === 'Core' ? '100 Đá + 30 Cống Hiến' :
                                                        member.Role === 'Inner' ? '50 Đá + 20 Cống Hiến' : '10 Đá + 10 Cống Hiến'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClaimSalary}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-sm font-bold shadow-lg"
                                    >
                                        Nhận Lương
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h3 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                                <Shield size={20} /> Thông Báo Tông Môn
                            </h3>
                            <div className="bg-black/30 p-4 rounded text-gray-300 italic h-48 overflow-y-auto">
                                {`Chào mừng các đạo hữu gia nhập ${sect.Name}. Hãy cùng nhau tu luyện, săn bắt linh thú và đưa tông môn lên đỉnh vinh quang!
- Tông Chủ ${sect.LeaderName}`}
                            </div>
                        </div>
                    </div>
                )}

                {/* MEMBERS TAB */}
                {activeTab === 'members' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-700">
                                    <th className="p-4">Tên</th>
                                    <th className="p-4">Vai Trò</th>
                                    <th className="p-4">Cống Hiến</th>
                                    <th className="p-4">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map(m => (
                                    <tr key={m.Id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4 font-bold text-white">{m.Username}</td>
                                        <td className={`p-4 font-bold ${m.Role === 'Leader' ? 'text-yellow-500' :
                                            m.Role === 'Elder' ? 'text-purple-400' : 'text-gray-300'
                                            }`}>
                                            {m.Role}
                                        </td>
                                        <td className="p-4 text-green-400">{m.Contribution}</td>
                                        <td className="p-4">
                                            {isLeader && m.Role !== 'Leader' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleManageMember(m.UserId, 'kick')}
                                                        className="text-red-500 hover:text-red-400 text-sm font-bold"
                                                    >
                                                        Trục Xuất
                                                    </button>
                                                    <button
                                                        onClick={() => handleManageMember(m.UserId, 'promote')}
                                                        className="text-green-500 hover:text-green-400 text-sm font-bold"
                                                    >
                                                        Thăng Chức
                                                    </button>
                                                    <button
                                                        onClick={() => handleManageMember(m.UserId, 'demote')}
                                                        className="text-yellow-500 hover:text-yellow-400 text-sm font-bold"
                                                    >
                                                        Giáng Chức
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* FACILITIES TAB */}
                {activeTab === 'facilities' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {buildings.map(b => (
                            <div key={b.Id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 bg-blue-900/50 rounded-bl-xl text-xs font-bold text-blue-300">
                                    Lv.{b.Level}
                                </div>
                                <div className="mb-4">
                                    {b.Type === 'MainHall' && <Crown size={40} className="text-yellow-500 mb-2" />}
                                    {b.Type === 'Pavilion' && <Book size={40} className="text-purple-500 mb-2" />}
                                    {b.Type === 'Alchemy' && <Zap size={40} className="text-green-500 mb-2" />}
                                    {b.Type === 'Vein' && <Database size={40} className="text-blue-500 mb-2" />}
                                    {b.Type === 'Mission' && <Star size={40} className="text-red-500 mb-2" />}

                                    <h3 className="text-xl font-bold text-white">
                                        {b.Type === 'MainHall' ? 'Đại Điện' :
                                            b.Type === 'Pavilion' ? 'Tàng Kinh Các' :
                                                b.Type === 'Alchemy' ? 'Đan Dược Đường' :
                                                    b.Type === 'Vein' ? 'Linh Mạch' : 'Nhiệm Vụ Đường'}
                                    </h3>
                                </div>
                                <p className="text-gray-400 text-sm mb-4 h-10">
                                    {b.Type === 'MainHall' ? 'Trung tâm quản lý, mở khóa kiến trúc mới.' :
                                        b.Type === 'Pavilion' ? 'Tăng chỉ số thụ động cho toàn bang.' :
                                            b.Type === 'Alchemy' ? 'Chế tạo đan dược hỗ trợ tu luyện.' :
                                                b.Type === 'Vein' ? 'Sản sinh Linh Thạch mỗi ngày.' : 'Cung cấp nhiệm vụ bang hội.'}
                                </p>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                                    <span className="text-xs text-gray-500">Nâng cấp: {b.Level * 1000} Tài Nguyên</span>
                                    <div className="flex gap-2">
                                        {b.Type === 'Vein' && (
                                            <button
                                                onClick={handleClaimVein}
                                                className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-bold animate-pulse"
                                            >
                                                Thu Hoạch
                                            </button>
                                        )}
                                        {isLeader && (
                                            <button
                                                onClick={() => handleUpgrade(b.Type)}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold"
                                            >
                                                Nâng Cấp
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MISSIONS TAB */}
                {activeTab === 'missions' && (
                    <div className="space-y-6">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                            <h3 className="text-2xl font-bold text-yellow-400 mb-2">Nhiệm Vụ Tông Môn</h3>
                            <p className="text-gray-400">Hoàn thành nhiệm vụ hàng ngày để nhận Cống Hiến và Kinh Nghiệm.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {missions.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">Đang tải nhiệm vụ...</div>
                            ) : (
                                missions.map(m => (
                                    <div key={m.Id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-lg text-white mb-1">{m.Title}</h4>
                                            <p className="text-sm text-gray-400 mb-2">{m.Description}</p>
                                            <div className="flex gap-4 text-xs font-bold">
                                                <span className="text-green-400">+{m.RewardContribution} Cống Hiến</span>
                                                <span className="text-blue-400">+{m.RewardExp} Exp</span>
                                            </div>
                                        </div>
                                        <div className="text-right min-w-[120px]">
                                            <div className="text-sm text-gray-300 mb-2">
                                                Tiến độ: <span className={m.Progress >= m.RequirementValue ? 'text-green-400' : 'text-yellow-400'}>
                                                    {m.Progress}/{m.RequirementValue}
                                                </span>
                                            </div>
                                            {m.IsClaimed ? (
                                                <button disabled className="px-4 py-2 bg-gray-700 text-gray-500 rounded font-bold cursor-not-allowed">
                                                    Đã Nhận
                                                </button>
                                            ) : m.Progress >= m.RequirementValue ? (
                                                <button
                                                    onClick={() => handleClaimMission(m.Id)}
                                                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-bold animate-pulse"
                                                >
                                                    Nhận Thưởng
                                                </button>
                                            ) : (
                                                <button disabled className="px-4 py-2 bg-gray-700 text-gray-500 rounded font-bold cursor-not-allowed">
                                                    Chưa Xong
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* PAVILION TAB (SCRIPTURE PAVILION) */}
                {activeTab === 'pavilion' && (
                    <div className="space-y-6">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-900/20 z-0"></div>
                            <h3 className="text-2xl font-bold text-blue-400 mb-2 relative z-10">Tàng Kinh Các</h3>
                            <p className="text-gray-400 relative z-10">Dùng Cống Hiến để học các bí kíp thất truyền, gia tăng sức mạnh vĩnh viễn.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {skills.length === 0 ? (
                                <div className="col-span-2 text-center py-8 text-gray-500">Đang tải bí kíp...</div>
                            ) : (
                                skills.map(s => (
                                    <div key={s.Id} className={`p-6 rounded-xl border relative overflow-hidden transition-all ${s.IsLearned ? 'bg-blue-900/20 border-blue-500/50' : 'bg-gray-800 border-gray-700 hover:border-blue-500'}`}>
                                        {s.IsLearned && (
                                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-bl">Đã Học</div>
                                        )}
                                        <h4 className="font-bold text-xl text-white mb-2">{s.Name}</h4>
                                        <p className="text-gray-400 text-sm mb-4 h-10">{s.Description}</p>

                                        <div className="flex justify-between items-end">
                                            <div className="text-sm">
                                                <div className="text-gray-500 mb-1">Yêu cầu: Lv.{s.ReqSectLevel}</div>
                                                <div className="font-bold text-yellow-400">{s.CostContribution} Cống Hiến</div>
                                            </div>

                                            {s.IsLearned ? (
                                                <button disabled className="px-4 py-2 bg-gray-700 text-gray-500 rounded font-bold cursor-not-allowed">
                                                    Đã Lĩnh Ngộ
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleLearnSkill(s.Id)}
                                                    disabled={member.Contribution < s.CostContribution || sect.Level < s.ReqSectLevel}
                                                    className={`px-4 py-2 rounded font-bold transition-all ${member.Contribution >= s.CostContribution && sect.Level >= s.ReqSectLevel
                                                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                                >
                                                    Học Ngay
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* AUCTION TAB */}
                {activeTab === 'auction' && (
                    <div className="space-y-6">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                            <h3 className="text-2xl font-bold text-yellow-400 mb-2">Sàn Đấu Giá</h3>
                            <p className="text-gray-400">Nơi các bảo vật quý hiếm được mang ra đấu giá công khai.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {auctions.length === 0 ? (
                                <div className="col-span-2 text-center py-8 text-gray-500">Không có phiên đấu giá nào.</div>
                            ) : (
                                auctions.map(a => (
                                    <div key={a.Id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-bl">HOT</div>
                                        <h4 className="font-bold text-lg text-white mb-1">{a.ItemName}</h4>
                                        <p className="text-sm text-gray-400 mb-4">{a.ItemDesc}</p>

                                        <div className="bg-black/30 p-3 rounded mb-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-400">Giá khởi điểm:</span>
                                                <span className="text-gray-300">{a.StartPrice}</span>
                                            </div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-400">Giá hiện tại:</span>
                                                <span className="text-yellow-400 font-bold">{a.CurrentBid}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Người giữ giá:</span>
                                                <span className="text-blue-400">{a.HighestBidderName || 'Chưa có'}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleBid(a.Id, a.CurrentBid)}
                                            className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-bold text-white"
                                        >
                                            Đấu Giá Ngay
                                        </button>
                                        <div className="text-center mt-2 text-xs text-gray-500">
                                            Kết thúc: {new Date(a.EndTime).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* BLACK MARKET TAB */}
                {activeTab === 'blackmarket' && (
                    <div className="space-y-6">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-purple-900/20 z-0"></div>
                            <h3 className="text-2xl font-bold text-purple-400 mb-2 relative z-10">Chợ Đen</h3>
                            <p className="text-gray-400 relative z-10">Nơi giao dịch ngầm các vật phẩm cấm kỵ. Giá cao nhưng chất lượng.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {blackMarketItems.length === 0 ? (
                                <div className="col-span-3 text-center py-8 text-gray-500">Chợ đen đang đóng cửa...</div>
                            ) : (
                                blackMarketItems.map(item => (
                                    <div key={item.Id} className="bg-gray-800 p-4 rounded-xl border border-purple-900/50 hover:border-purple-500 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg text-white">{item.ItemName}</h4>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${item.Rarity === 'Legendary' ? 'bg-yellow-600 text-black' :
                                                item.Rarity === 'Epic' ? 'bg-purple-600 text-white' : 'bg-gray-600'
                                                }`}>{item.Rarity}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">{item.ItemDesc}</p>

                                        <div className="flex justify-between items-center mt-4">
                                            <div className="text-yellow-400 font-bold">{item.Price} Đá</div>
                                            <div className="text-gray-500 text-sm">Còn: {item.Stock}</div>
                                        </div>

                                        <button
                                            onClick={() => handleBuyBlackMarket(item.Id, item.Price)}
                                            className="w-full mt-4 py-2 bg-purple-700 hover:bg-purple-600 rounded font-bold text-white shadow-lg shadow-purple-900/50"
                                        >
                                            Mua Ngay
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
                {/* SHOP TAB */}
                {activeTab === 'shop' && (
                    <div className="space-y-8">
                        {/* Inventory Section */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h3 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                                <Database size={20} /> Túi Đồ Của Bạn
                            </h3>
                            {inventory.length === 0 ? (
                                <p className="text-gray-500 italic">Túi đồ trống rỗng...</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {inventory.map(item => (
                                        <div key={item.Id} className="bg-gray-900 p-3 rounded border border-gray-700 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${item.Rarity === 'Common' ? 'bg-gray-600' :
                                                item.Rarity === 'Uncommon' ? 'bg-green-600' :
                                                    item.Rarity === 'Rare' ? 'bg-blue-600' : 'bg-purple-600'
                                                }`}>
                                                {item.Quantity}x
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-white">{item.Name}</div>
                                                <div className="text-xs text-gray-400">{item.Type}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Shop Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {shopItems.map(item => (
                                <div key={item.Id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative group hover:border-yellow-500 transition-all">
                                    <div className={`absolute top-0 right-0 px-2 py-1 rounded-bl-xl text-xs font-bold ${item.Rarity === 'Common' ? 'bg-gray-600' :
                                        item.Rarity === 'Uncommon' ? 'bg-green-600' :
                                            item.Rarity === 'Rare' ? 'bg-blue-600' : 'bg-purple-600'
                                        }`}>
                                        {item.Rarity}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">{item.Name}</h3>
                                    <p className="text-xs text-gray-400 mb-2">{item.Type}</p>
                                    <p className="text-sm text-gray-300 mb-4 h-10 line-clamp-2">{item.Description}</p>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                                        <div className="text-yellow-400 font-bold text-sm">
                                            {item.CostContribution} Cống Hiến
                                        </div>
                                        <button
                                            onClick={() => handleBuyItem(item.Id)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold"
                                        >
                                            Mua
                                        </button>
                                    </div>
                                    <div className="absolute bottom-2 right-2 text-[10px] text-gray-500">
                                        Yêu cầu: {item.ReqRole}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SectPage;
