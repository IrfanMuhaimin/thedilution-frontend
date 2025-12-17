import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUsers, FaUserCheck, FaUserTimes, FaBuilding, FaUserShield, FaUserMd, FaUserCog, FaExclamationTriangle } from 'react-icons/fa';
import { format } from 'date-fns';
import * as userService from '../services/userService';
import UserModal from '../components/UserModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import '../styles/UserManagement.css';

function UserManagementPage() {
    // State for the full user list
    const [users, setUsers] = useState([]);
    
    // State for filtering & searching
    const [roleFilter, setRoleFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err) { setError(err.message); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- LOGIC REORDERED: Search is now applied BEFORE the role filter ---
    useEffect(() => {
        let result = users;

        // 1. Apply search term filter first
        if (searchTerm) {
            result = result.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.department.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Apply role filter on the result of the search
        if (roleFilter !== 'All') {
            result = result.filter(user => user.role === roleFilter);
        }

        setFilteredUsers(result);
    }, [users, roleFilter, searchTerm]);

    // Calculate stats
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status).length;
    const inactiveUsers = totalUsers - activeUsers;

    // --- All handler functions remain the same ---
    const handleAdd = () => { setCurrentUser(null); setShowUserModal(true); };
    const handleEdit = (user) => { setCurrentUser(user); setShowUserModal(true); };
    const handleDelete = (user) => { setUserToDelete(user); setShowDeleteModal(true); };

    const handleSaveUser = async (userData) => {
        try {
            if (currentUser && currentUser.userId) {
                await userService.updateUser(currentUser.userId, userData);
            } else {
                await userService.addUser(userData);
            }
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

    // Get initials for avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    // Get role badge class
    const getRoleBadgeClass = (role) => {
        switch (role.toLowerCase()) {
            case 'admin': return 'admin';
            case 'pharmacist': return 'pharmacist';
            case 'doctor': return 'doctor';
            default: return 'pharmacist';
        }
    };

    // Get role icon
    const getRoleIcon = (role) => {
        switch (role.toLowerCase()) {
            case 'admin': return <FaUserShield />;
            case 'pharmacist': return <FaUserCog />;
            case 'doctor': return <FaUserMd />;
            default: return <FaUserCog />;
        }
    };

    return (
        <div className="user-management-page">
            <div className="um-card">
                {/* Header */}
                <div className="um-header">
                    <div className="um-header-content">
                        <div className="um-header-icon">
                            <FaUsers />
                        </div>
                        <div>
                            <h1 className="um-title">User Management</h1>
                            <p className="um-subtitle">Manage system users and their permissions</p>
                        </div>
                    </div>
                    <button className="um-btn-add" onClick={handleAdd}>
                        <span className="um-btn-add-icon"><FaPlus /></span>
                        Add New User
                    </button>
                </div>

                {/* Body */}
                <div className="um-body">
                    {/* Stats Bar */}
                    <div className="um-stats-bar">
                        <div className="um-stat-item">
                            <div className="um-stat-icon total">
                                <FaUsers />
                            </div>
                            <div className="um-stat-content">
                                <span className="um-stat-value">{totalUsers}</span>
                                <span className="um-stat-label">Total Users</span>
                            </div>
                        </div>
                        <div className="um-stat-item">
                            <div className="um-stat-icon active">
                                <FaUserCheck />
                            </div>
                            <div className="um-stat-content">
                                <span className="um-stat-value">{activeUsers}</span>
                                <span className="um-stat-label">Active</span>
                            </div>
                        </div>
                        <div className="um-stat-item">
                            <div className="um-stat-icon inactive">
                                <FaUserTimes />
                            </div>
                            <div className="um-stat-content">
                                <span className="um-stat-value">{inactiveUsers}</span>
                                <span className="um-stat-label">Inactive</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="um-filters">
                        <div className="um-filter-group">
                            <label className="um-filter-label">Search Users</label>
                            <div className="um-search-wrapper">
                                <input
                                    type="text"
                                    className="um-search-input"
                                    placeholder="Search by name or department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="um-search-icon" />
                            </div>
                        </div>
                        <div className="um-filter-group">
                            <label className="um-filter-label">Filter by Role</label>
                            <select 
                                className="um-select"
                                value={roleFilter} 
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="All">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Pharmacist">Pharmacist</option>
                                <option value="Doctor">Doctor</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Error Alert */}
                    {error && (
                        <div className="um-alert">
                            <FaExclamationTriangle className="um-alert-icon" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Table */}
                    {loading ? (
                        <div className="um-loading">
                            <div className="um-spinner"></div>
                            <span className="um-loading-text">Loading users...</span>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="um-empty">
                            <div className="um-empty-icon">
                                <FaUsers />
                            </div>
                            <h3 className="um-empty-title">No users found</h3>
                            <p className="um-empty-description">
                                {searchTerm || roleFilter !== 'All' 
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Get started by adding your first user'}
                            </p>
                        </div>
                    ) : (
                        <div className="um-table-container">
                            <table className="um-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Department</th>
                                        <th>Status</th>
                                        <th>Activated</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.userId}>
                                            <td>
                                                <span className="um-user-id">#{user.userId}</span>
                                            </td>
                                            <td>
                                                <div className="um-user-info">
                                                    <div className="um-avatar">
                                                        {getInitials(user.username)}
                                                    </div>
                                                    <span className="um-username">{user.username}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`um-role-badge ${getRoleBadgeClass(user.role)}`}>
                                                    {getRoleIcon(user.role)}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="um-department">
                                                    <FaBuilding className="um-department-icon" />
                                                    {user.department}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`um-status-badge ${user.status ? 'active' : 'inactive'}`}>
                                                    <span className="um-status-dot"></span>
                                                    {user.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="um-date">
                                                    {user.active ? format(new Date(user.active), 'dd MMM yyyy') : 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="um-actions">
                                                    <button 
                                                        className="um-btn-action um-btn-edit" 
                                                        onClick={() => handleEdit(user)}
                                                        title="Edit user"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button 
                                                        className="um-btn-action um-btn-delete" 
                                                        onClick={() => handleDelete(user)}
                                                        title="Delete user"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <UserModal 
                show={showUserModal}
                handleClose={() => setShowUserModal(false)}
                handleSave={handleSaveUser}
                user={currentUser}
            />

            <DeleteConfirmationModal 
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDelete}
                userName={userToDelete?.username}
            />
        </div>
    );
}

export default UserManagementPage;