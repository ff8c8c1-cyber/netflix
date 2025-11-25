import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreeDPetRenderer from '../components/pet/ThreeDPetRenderer';
import { Sword, Shield, Zap, Flame, Snowflake, Wind, Trophy, History, Users } from 'lucide-react';

import { API_BASE_URL } from '../config/api';

const PvPPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [view, setView] = useState('lobby'); // lobby, leaderboard, history
    const [opponents, setOpponents] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [history, setHistory] = useState([]);

    // Battle State
    const [battleState, setBattleState] = useState('idle'); // idle, battling, result
    const [battleData, setBattleData] = useState(null);
    const [battleLog, setBattleLog] = useState([]);
    const [myPetHp, setMyPetHp] = useState(100);
    const [oppPetHp, setOppPetHp] = useState(100);
    const [activeSkill, setActiveSkill] = useState({ my: null, opp: null });
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const logEndRef = useRef(null);

    // Fetch User & Opponents
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            fetchOpponents(u.id);
        }
    }, []);

    useEffect(() => {
        if (view === 'leaderboard') fetchLeaderboard();
        if (view === 'history') fetchHistory(user.id);
    }, [view]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [battleLog]);

    const fetchOpponents = async (userId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/pvp/opponents?userId=${userId}`);
            const data = await res.json();
            setOpponents(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/pvp/leaderboard`);
            const data = await res.json();
            setLeaderboard(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHistory = async (userId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/pvp/history?userId=${userId}`);
            const data = await res.json();
            setHistory(data);
        } catch (err) {
            console.error(err);
        }
    };

    const startBattle = async (opponentPetId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/pvp/challenge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, opponentPetId })
            });
            const data = await res.json();
            setBattleData(data);
            setBattleState('battling');
            setBattleLog([{ text: 'Battle Start!', type: 'info' }]);
            setMyPetHp(data.myHp);
            setOppPetHp(data.oppHp);

            const mySpd = data.myPet.stats.spd || 10;
            const oppSpd = data.oppPet.stats.spd || 10;
            setIsPlayerTurn(mySpd >= oppSpd);
            if (mySpd < oppSpd) {
                setIsPlayerTurn(true);
            }

        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (action, skillName = null) => {
        if (!isPlayerTurn || isProcessing) return;
        setIsProcessing(true);

        try {
            if (action === 'Skill') {
                setActiveSkill(prev => ({ ...prev, my: skillName }));
                setTimeout(() => setActiveSkill(prev => ({ ...prev, my: null })), 2000);
            }

            const res = await fetch(`${API_BASE_URL}/api/pvp/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId: battleData.matchId,
                    action,
                    skillName
                })
            });
            const result = await res.json();

            const playerText = `${battleData.myPet.Name} ${result.player.action} for ${result.player.damage} dmg!`;
            setBattleLog(prev => [...prev, { text: playerText, type: 'player' }]);
            setOppPetHp(prev => Math.max(0, prev - result.player.damage));

            setTimeout(() => {
                if (result.isOver && result.winnerId === battleData.myPet.UserId) {
                    endBattle(result);
                    return;
                }

                if (result.ai.action.includes('used')) {
                    const aiSkill = result.ai.action.replace('used ', '');
                    setActiveSkill(prev => ({ ...prev, opp: aiSkill }));
                    setTimeout(() => setActiveSkill(prev => ({ ...prev, opp: null })), 2000);
                }

                const aiText = `${battleData.oppPet.Name} ${result.ai.action} for ${result.ai.damage} dmg!`;
                setBattleLog(prev => [...prev, { text: aiText, type: 'enemy' }]);
                setMyPetHp(prev => Math.max(0, prev - result.ai.damage));

                if (result.isOver) {
                    setTimeout(() => endBattle(result), 1000);
                } else {
                    setIsProcessing(false);
                }
            }, 1500);

        } catch (err) {
            console.error(err);
            setIsProcessing(false);
        }
    };

    const endBattle = (result) => {
        setBattleData(prev => ({ ...prev, ...result }));
        setBattleState('result');
        setIsProcessing(false);
    };

    if (!user) return <div className="text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 ml-0 md:ml-64">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
                    Đấu Trường Thần Thú
                </h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setView('lobby')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${view === 'lobby' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                        <Sword size={20} /> Đấu Trường
                    </button>
                    <button
                        onClick={() => setView('leaderboard')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${view === 'leaderboard' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                        <Trophy size={20} /> BXH
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${view === 'history' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                        <History size={20} /> Lịch Sử
                    </button>
                </div>
            </div>

            {/* LOBBY VIEW */}
            {view === 'lobby' && battleState === 'idle' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {opponents.map(opp => (
                        <div key={opp.Id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all group">
                            <div className="h-48 bg-gray-900 rounded-lg mb-4 overflow-hidden relative">
                                <img src={opp.VisualUrl} alt={opp.Name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-bold drop-shadow-lg">{opp.Species}</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-yellow-400">{opp.Name}</h3>
                            <p className="text-gray-400 text-sm mb-4">Chủ nhân: {opp.OwnerName}</p>
                            <div className="flex justify-between text-gray-300 mb-4 bg-gray-700/50 p-2 rounded">
                                <span>Cấp: {opp.Level}</span>
                                <span className="text-yellow-300">Elo: {opp.Elo}</span>
                            </div>
                            <button
                                onClick={() => startBattle(opp.Id)}
                                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all"
                            >
                                THÁCH ĐẤU
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* LEADERBOARD VIEW */}
            {view === 'leaderboard' && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-2xl font-bold mb-6 text-yellow-400 flex items-center gap-2">
                        <Trophy /> Bảng Xếp Hạng Elo
                    </h2>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-700">
                                <th className="p-4">Hạng</th>
                                <th className="p-4">Linh Thú</th>
                                <th className="p-4">Chủ Nhân</th>
                                <th className="p-4">Cấp</th>
                                <th className="p-4">Elo</th>
                                <th className="p-4">Thắng/Thua</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((item, idx) => (
                                <tr key={item.Id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                    <td className="p-4 font-bold text-xl">
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                    </td>
                                    <td className="p-4 flex items-center gap-3">
                                        <img src={item.VisualUrl} className="w-10 h-10 rounded-full object-cover border border-gray-600" />
                                        <span className={item.Id === battleData?.myPet?.Id ? 'text-green-400' : ''}>{item.Name}</span>
                                    </td>
                                    <td className="p-4 text-gray-300">{item.OwnerName}</td>
                                    <td className="p-4 text-cyan-400 font-bold">{item.Level}</td>
                                    <td className="p-4 text-yellow-400 font-bold">{item.Elo}</td>
                                    <td className="p-4 text-gray-400">{item.Wins}W - {item.Losses}L</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* HISTORY VIEW */}
            {view === 'history' && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-2xl font-bold mb-6 text-blue-400 flex items-center gap-2">
                        <History /> Lịch Sử Đấu
                    </h2>
                    <div className="space-y-4">
                        {history.map(match => (
                            <div key={match.Id} className="bg-gray-900/50 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                                <div className="flex items-center gap-4">
                                    <span className={`font-bold ${match.WinnerId === user.id ? 'text-green-500' : 'text-red-500'}`}>
                                        {match.WinnerId === user.id ? 'THẮNG' : 'THUA'}
                                    </span>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <span className="font-bold text-white">{match.P1Name}</span>
                                        <span className="text-gray-500">vs</span>
                                        <span className="font-bold text-white">{match.P2Name}</span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {new Date(match.CreatedAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && <div className="text-gray-500 text-center py-8">Chưa có trận đấu nào.</div>}
                    </div>
                </div>
            )}

            {/* BATTLE VIEW */}
            {battleState === 'battling' && battleData && (
                <div className="flex flex-col h-[85vh]">
                    {/* Battle Arena */}
                    <div className="flex-1 grid grid-cols-2 gap-8 mb-4 relative">
                        {/* My Pet */}
                        <div className="relative bg-gray-800/50 rounded-2xl overflow-hidden border-2 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                            <div className="absolute top-4 left-4 z-10 w-64">
                                <h3 className="text-2xl font-bold text-blue-400 mb-1">{battleData.myPet.Name}</h3>
                                <div className="w-full h-6 bg-gray-900 rounded-full border border-gray-600 overflow-hidden relative">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                                        style={{ width: `${(myPetHp / battleData.myPet.stats.hp) * 100}%` }}
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                                        {Math.floor(myPetHp)} / {battleData.myPet.stats.hp}
                                    </span>
                                </div>
                            </div>
                            <ThreeDPetRenderer
                                species={battleData.myPet.Species}
                                element={battleData.myPet.Element}
                                tier={battleData.myPet.Tier}
                                castSkill={activeSkill.my}
                            />
                        </div>

                        {/* Opponent Pet */}
                        <div className="relative bg-gray-800/50 rounded-2xl overflow-hidden border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                            <div className="absolute top-4 right-4 z-10 w-64 text-right">
                                <h3 className="text-2xl font-bold text-red-400 mb-1">{battleData.oppPet.Name}</h3>
                                <div className="w-full h-6 bg-gray-900 rounded-full border border-gray-600 overflow-hidden relative">
                                    <div
                                        className="h-full bg-gradient-to-l from-red-500 to-orange-400 transition-all duration-500"
                                        style={{ width: `${(oppPetHp / battleData.oppPet.stats.hp) * 100}%`, marginLeft: 'auto' }}
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                                        {Math.floor(oppPetHp)} / {battleData.oppPet.stats.hp}
                                    </span>
                                </div>
                            </div>
                            <ThreeDPetRenderer
                                species={battleData.oppPet.Species}
                                element={battleData.oppPet.Element}
                                tier={battleData.oppPet.Tier}
                                castSkill={activeSkill.opp}
                            />
                        </div>

                        {/* VS Badge */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                            <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)] italic">VS</span>
                        </div>
                    </div>

                    {/* Control Panel & Log */}
                    <div className="h-64 grid grid-cols-3 gap-4">
                        {/* Battle Log */}
                        <div className="col-span-1 bg-black/60 rounded-xl p-4 overflow-y-auto font-mono text-sm border border-gray-700 shadow-inner">
                            {battleLog.map((log, idx) => (
                                <div key={idx} className={`mb-2 ${log.type === 'player' ? 'text-blue-300' :
                                    log.type === 'enemy' ? 'text-red-300' : 'text-yellow-400 text-center font-bold'
                                    }`}>
                                    {log.text}
                                </div>
                            ))}
                            <div ref={logEndRef} />
                        </div>

                        {/* Skills */}
                        <div className="col-span-2 bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col justify-center">
                            <div className="flex gap-4 justify-center">
                                {/* Basic Attack */}
                                <button
                                    onClick={() => handleAction('Attack')}
                                    disabled={!isPlayerTurn || isProcessing}
                                    className={`flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 transition-all ${!isPlayerTurn || isProcessing
                                        ? 'bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed'
                                        : 'bg-gray-700 border-white hover:bg-gray-600 hover:scale-105 hover:border-yellow-400'
                                        }`}
                                >
                                    <Sword size={32} className="mb-2" />
                                    <span className="font-bold text-sm">Tấn Công</span>
                                </button>

                                {/* Skills */}
                                {battleData.myPet.skills.map((skill, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAction('Skill', skill.name)}
                                        disabled={!isPlayerTurn || isProcessing}
                                        className={`flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 transition-all relative group ${!isPlayerTurn || isProcessing
                                            ? 'bg-indigo-900/50 border-indigo-800 opacity-50 cursor-not-allowed'
                                            : 'bg-indigo-900 border-indigo-500 hover:bg-indigo-800 hover:scale-105 hover:border-cyan-400'
                                            }`}
                                    >
                                        <Zap size={32} className="mb-2 text-cyan-400" />
                                        <span className="font-bold text-xs text-center px-1 truncate w-full">{skill.name}</span>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 bg-black/90 p-2 rounded text-xs w-40 hidden group-hover:block z-50 pointer-events-none">
                                            {skill.desc}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="text-center mt-4 text-gray-400 text-sm">
                                {isProcessing ? 'Đang xử lý...' : isPlayerTurn ? 'Lượt của bạn!' : 'Đối thủ đang đánh...'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {battleState === 'result' && battleData && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-gray-800 p-8 rounded-2xl border-2 border-yellow-500 text-center max-w-md w-full shadow-[0_0_50px_rgba(234,179,8,0.3)] transform scale-110">
                        <h2 className={`text-6xl font-black mb-6 ${battleData.isWin ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600' : 'text-gray-500'}`}>
                            {battleData.isWin ? 'CHIẾN THẮNG' : 'THẤT BẠI'}
                        </h2>
                        <div className="text-3xl mb-8 font-bold">
                            Elo: <span className={battleData.eloChange > 0 ? 'text-green-400' : 'text-red-400'}>
                                {battleData.eloChange > 0 ? '+' : ''}{battleData.eloChange}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                setBattleState('idle');
                                setView('lobby');
                                fetchOpponents(user.id);
                            }}
                            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-xl shadow-lg hover:shadow-blue-500/50 transition-all"
                        >
                            Tiếp Tục
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PvPPage;
