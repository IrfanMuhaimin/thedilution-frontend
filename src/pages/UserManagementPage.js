import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    FaPlus, FaEdit, FaSearch, FaUsers, FaUserCheck, 
    FaUserTimes, FaBuilding, FaUserShield, FaUserMd, 
    FaUserCog, FaExclamationTriangle, FaArchive 
} from 'react-icons/fa';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as userService from '../services/userService';
import UserModal from '../components/UserModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import '../styles/UserManagement.css';

function UserManagementPage() {
    const { user: loggedInUser } = useAuth(); 
    const navigate = useNavigate();
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [roleFilter, setRoleFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true); setError('');
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err) { setError("Failed to load users."); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        let result = users;
        if (searchTerm) {
            result = result.filter(u =>
                u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.department.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (roleFilter !== 'All') {
            result = result.filter(u => u.role === roleFilter);
        }
        return result;
    }, [users, roleFilter, searchTerm]);

    const stats = useMemo(() => {
        return {
            total: users.length,
            active: users.filter(u => u.status === 'active' || u.status === true).length,
            inactive: users.filter(u => u.status !== 'active' && u.status !== true).length
        };
    }, [users]);

    const handleAdd = () => { setCurrentUser(null); setShowUserModal(true); };
    const handleEdit = (user) => { setCurrentUser(user); setShowUserModal(true); };
    const handleDelete = (user) => { setUserToDelete(user); setShowDeleteModal(true); };

    const handleSaveUser = async (userData) => {
        try {
            if (currentUser && currentUser.userId) await userService.updateUser(currentUser.userId, userData);
            else await userService.addUser(userData);
            setShowUserModal(false);
            fetchUsers();
        } catch (err) { alert(err.message); }
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await userService.deleteUser(userToDelete.userId);
            setShowDeleteModal(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (err) { setError(err.message); }
    };

    const getInitials = (name) => name?.charAt(0).toUpperCase() || 'U';

    const getRoleBadgeClass = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'admin';
            case 'pharmacist': return 'pharmacist';
            case 'doctor': return 'doctor';
            default: return 'pharmacist';
        }
    };

    const getRoleIcon = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return <FaUserShield />;
            case 'pharmacist': return <FaUserCog />;
            case 'doctor': return <FaUserMd />;
            default: return <FaUserCog />;
        }
    };

    return (
        <div className="user-management-page">
            <div className="um-card">
                <div className="um-header">
                    <div className="um-header-content">
                        <div className="um-header-icon"><FaUsers /></div>
                        <div>
                            <h1 className="um-title">User Management</h1>
                            <p className="um-subtitle">Administrative Control Panel</p>
                        </div>
                    </div>
                    <button className="um-btn-add" onClick={handleAdd}>
                        <span className="um-btn-add-icon"><FaPlus /></span> Add New User
                    </button>
                </div>

                <div className="um-body">
                    <div className="um-stats-bar">
                        <div className="um-stat-item"><div className="um-stat-icon total"><FaUsers /></div><div className="um-stat-content"><span className="um-stat-value">{stats.total}</span><span className="um-stat-label">Total Users</span></div></div>
                        <div className="um-stat-item"><div className="um-stat-icon active"><FaUserCheck /></div><div className="um-stat-content"><span className="um-stat-value">{stats.active}</span><span className="um-stat-label">Active</span></div></div>
                        <div className="um-stat-item"><div className="um-stat-icon inactive"><FaUserTimes /></div><div className="um-stat-content"><span className="um-stat-value">{stats.inactive}</span><span className="um-stat-label">Inactive</span></div></div>
                    </div>

                    <div className="um-filters">
                        <div className="um-filter-group">
                            <label className="um-filter-label">Search Users</label>
                            <div className="um-search-wrapper">
                                <input type="text" className="um-search-input" placeholder="Name or Department..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                <FaSearch className="um-search-icon" />
                            </div>
                        </div>
                        <div className="um-filter-group">
                            <label className="um-filter-label">Filter by Role</label>
                            <select className="um-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                <option value="All">All Roles</option><option value="Admin">Admin</option><option value="Pharmacist">Pharmacist</option><option value="Doctor">Doctor</option>
                            </select>
                        </div>
                    </div>
                    
                    {error && <div className="um-alert"><FaExclamationTriangle className="um-alert-icon" /><span>{error}</span></div>}

                    {loading ? (
                        <div className="um-loading"><div className="um-spinner"></div><span className="um-loading-text">Synchronizing database...</span></div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="um-empty"><div className="um-empty-icon"><FaUsers /></div><h3 className="um-empty-title">No matching users found</h3><p className="um-empty-description">Try adjusting your filters or search terms.</p></div>
                    ) : (
                        <div className="um-table-container">
                            <table className="um-table">
                                <thead>
                                    <tr>
                                        <th className="ps-4">User Profile</th>
                                        <th>Role</th>
                                        <th>Department</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th className="text-center pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(userItem => {
                                        const isActive = userItem.status === 'active' || userItem.status === true;
                                        return (
                                            <tr key={userItem.userId}>
                                                <td className="ps-4">
                                                    <div className="um-user-info">
                                                        <div className="um-avatar">
                                                            {userItem.profilePicture ? (
                                                                <img src={userItem.profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                            ) : getInitials(userItem.username)}
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            <span className="um-username">{userItem.username}</span>
                                                            <span className="small text-muted">ID: #{userItem.userId}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className={`um-role-badge ${getRoleBadgeClass(userItem.role)}`}>{getRoleIcon(userItem.role)} {userItem.role}</span></td>
                                                <td><div className="um-department"><FaBuilding className="um-department-icon" /> {userItem.department}</div></td>
                                                <td>
                                                    {/* --- NEW: Custom Pill Status Logic --- */}
                                                    <span className={`custom-status-badge ${isActive ? 'bg-status-active' : 'bg-status-inactive'}`}>
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td><span className="um-date">{userItem.active ? format(new Date(userItem.active), 'dd MMM yyyy') : 'N/A'}</span></td>
                                                <td className="text-center pe-4">
                                                    {userItem.userId === loggedInUser.userId ? (
                                                        <span className="current-user-label"><FaUserCheck className="me-2" /> Your Current Account</span>
                                                    ) : (
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <button className="btn-table-action" onClick={() => handleEdit(userItem)} title="Edit user info">
                                                                <FaEdit />
                                                            </button>
                                                            <button className="btn-table-action" onClick={() => handleDelete(userItem)} title="Archive this user">
                                                                <FaArchive />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && (
                        <div className="d-flex justify-content-center mt-4 mb-2">
                            <button className="btn btn-light shadow-sm" style={{ borderRadius: '50px', padding: '10px 30px', border: '1px dashed #cbd5e1' }} onClick={() => navigate('/users/archive')}>
                                <FaArchive className="me-2 text-muted" /> <span className="fw-bold text-muted">View Archived Users</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <UserModal show={showUserModal} handleClose={() => setShowUserModal(false)} handleSave={handleSaveUser} user={currentUser} />
            <DeleteConfirmationModal 
                show={showDeleteModal} handleClose={() => setShowDeleteModal(false)} handleConfirm={handleConfirmDelete} 
                itemName={userToDelete?.username} 
                entityName="User" 
                actionType="Archive" 
                isProcessing={false} 
            />
        </div>
    );
}

export default UserManagementPage;