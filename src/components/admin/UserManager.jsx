import React, { useState, useEffect } from 'react';
import { adminService } from '../../lib/services';
import { Edit, Trash2, Save, X, Package } from 'lucide-react';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setEditForm({
            username: user.username,
            email: user.email || '',
            role: user.role || 'user',
            rank: user.rank || 0,
            exp: user.exp || 0,
            stones: user.stones || 0,
            mysteryBags: user.mystery_bags || 0
        });
    };

    const handleSave = async (id) => {
        try {
            await adminService.updateUser(id, editForm);
            setEditingId(null);
            loadUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will delete all user data including inventory and history.')) {
            try {
                await adminService.deleteUser(id);
                loadUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Username</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Rank</th>
                                <th className="p-4">EXP</th>
                                <th className="p-4">Stones</th>
                                <th className="p-4">Bags</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-700/50">
                                    <td className="p-4">{user.id}</td>
                                    <td className="p-4">
                                        {editingId === user.id ? (
                                            <input
                                                className="bg-gray-700 p-1 rounded w-full"
                                                value={editForm.username}
                                                onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                            />
                                        ) : (
                                            <span className="font-medium text-white">{user.username}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {editingId === user.id ? (
                                            <select
                                                className="bg-gray-700 p-1 rounded"
                                                value={editForm.role}
                                                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-gray-600/20 text-gray-400'}`}>
                                                {user.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {editingId === user.id ? (
                                            <input
                                                type="number"
                                                className="bg-gray-700 p-1 rounded w-16"
                                                value={editForm.rank}
                                                onChange={e => setEditForm({ ...editForm, rank: parseInt(e.target.value) })}
                                            />
                                        ) : (
                                            user.rank
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {editingId === user.id ? (
                                            <input
                                                type="number"
                                                className="bg-gray-700 p-1 rounded w-20"
                                                value={editForm.exp}
                                                onChange={e => setEditForm({ ...editForm, exp: parseInt(e.target.value) })}
                                            />
                                        ) : (
                                            <span className="text-blue-400">{user.exp?.toLocaleString()}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {editingId === user.id ? (
                                            <input
                                                type="number"
                                                className="bg-gray-700 p-1 rounded w-24"
                                                value={editForm.stones}
                                                onChange={e => setEditForm({ ...editForm, stones: parseInt(e.target.value) })}
                                            />
                                        ) : (
                                            <span className="text-yellow-400">{user.stones?.toLocaleString()}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {editingId === user.id ? (
                                            <input
                                                type="number"
                                                className="bg-gray-700 p-1 rounded w-16"
                                                value={editForm.mysteryBags}
                                                onChange={e => setEditForm({ ...editForm, mysteryBags: parseInt(e.target.value) })}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-1 text-purple-400">
                                                <Package size={14} />
                                                {user.mystery_bags || 0}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        {editingId === user.id ? (
                                            <>
                                                <button onClick={() => handleSave(user.id)} className="p-2 bg-green-600/20 text-green-400 rounded hover:bg-green-600/40">
                                                    <Save size={16} />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-2 bg-gray-600/20 text-gray-400 rounded hover:bg-gray-600/40">
                                                    <X size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEdit(user)} className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/40">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40">
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {loading && <div className="p-4 text-center text-gray-400">Loading users...</div>}
            </div>
        </div>
    );
};

export default UserManager;
