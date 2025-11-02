import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { roleService } from '../services/roleService';
import type { User, Role, CreateUserRequest, UpdateUserRequest } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    name: '',
    lastName: '',
    chileanRutNumber: '',
    roleIds: [],
  });

  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        userService.getAllUsers(),
        roleService.getAllRoles(),
      ]);
      setUsers(usersData.users);
      setRoles(rolesData.roles);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await userService.createUser(formData);
      setSuccess('User created successfully');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      setError(null);
      const updateData: UpdateUserRequest = {
        username: formData.username,
        email: formData.email,
        name: formData.name,
        lastName: formData.lastName,
        chileanRutNumber: formData.chileanRutNumber,
      };
      await userService.updateUser(selectedUser.id, updateData);
      setSuccess('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError(null);
      await userService.changeUserPassword(selectedUser.id, passwordData.password);
      setSuccess('Password changed successfully');
      setShowPasswordModal(false);
      setSelectedUser(null);
      setPasswordData({ password: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  const handleChangeRoles = async (userId: number, roleIds: number[]) => {
    try {
      setError(null);
      await userService.changeUserRoles(userId, roleIds);
      setSuccess('User roles updated successfully');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user roles');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      setError(null);
      await userService.deleteUser(selectedUser.id);
      setSuccess('User deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      name: '',
      lastName: '',
      chileanRutNumber: '',
      roleIds: [],
    });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      name: user.name || '',
      lastName: user.lastName || '',
      chileanRutNumber: user.chileanRutNumber || '',
      roleIds: roles.filter(r => user.roles.includes(r.name)).map(r => r.id),
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user: User) => {
    setSelectedUser(user);
    setPasswordData({ password: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const openDeleteConfirm = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create User
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          {success}
          <button
            onClick={() => setSuccess(null)}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.name} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2">
                    <label className="text-xs font-medium text-gray-500">Roles:</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {roles.map((role) => {
                        const isSelected = user.roles.includes(role.name);
                        return (
                          <label key={role.id} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const currentRoleIds = roles
                                  .filter(r => user.roles.includes(r.name))
                                  .map(r => r.id);
                                if (e.target.checked) {
                                  handleChangeRoles(user.id, [...currentRoleIds, role.id]);
                                } else {
                                  handleChangeRoles(user.id, currentRoleIds.filter(id => id !== role.id));
                                }
                              }}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-xs text-gray-700">{role.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openPasswordModal(user)}
                    className="px-3 py-1 text-sm text-yellow-600 hover:text-yellow-900"
                  >
                    Password
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(user)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Create User</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roles:</label>
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <label key={role.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.roleIds?.includes(role.id)}
                          onChange={(e) => {
                            const roleIds = formData.roleIds || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, roleIds: [...roleIds, role.id] });
                            } else {
                              setFormData({ ...formData, roleIds: roleIds.filter(id => id !== role.id) });
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">{role.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Change Password for {selectedUser.username}</h3>
            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="New Password"
                  required
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    setPasswordData({ password: '', confirmPassword: '' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete user <strong>{selectedUser.username}</strong>?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

