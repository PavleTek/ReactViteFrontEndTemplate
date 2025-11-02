import React, { useState, useEffect } from 'react';
import { roleService } from '../services/roleService';
import type { Role } from '../types';

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.getAllRoles();
      setRoles(data.roles);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await roleService.createRole(roleName);
      setSuccess('Role created successfully');
      setShowCreateModal(false);
      setRoleName('');
      loadRoles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create role');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    try {
      setError(null);
      await roleService.updateRole(selectedRole.id, roleName);
      setSuccess('Role updated successfully');
      setShowEditModal(false);
      setSelectedRole(null);
      setRoleName('');
      loadRoles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    
    try {
      setError(null);
      await roleService.deleteRole(selectedRole.id);
      setSuccess('Role deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedRole(null);
      loadRoles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete role');
    }
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setShowEditModal(true);
  };

  const openDeleteConfirm = (role: Role) => {
    setSelectedRole(role);
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
        <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        <button
          onClick={() => {
            setRoleName('');
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create Role
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
          {roles.map((role) => (
            <li key={role.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{role.name}</p>
                  {role.name === 'admin' && (
                    <p className="text-xs text-gray-500 mt-1">System role - cannot be modified or deleted</p>
                  )}
                </div>
                <div className="ml-4 flex space-x-2">
                  <button
                    onClick={() => openEditModal(role)}
                    disabled={role.name === 'admin'}
                    className={`px-3 py-1 text-sm rounded-md ${
                      role.name === 'admin'
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-indigo-600 hover:text-indigo-900'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(role)}
                    disabled={role.name === 'admin'}
                    className={`px-3 py-1 text-sm rounded-md ${
                      role.name === 'admin'
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-red-600 hover:text-red-900'
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Create Role</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Role Name"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value.toLowerCase().trim())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setRoleName('');
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

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Edit Role</h3>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Role Name"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value.toLowerCase().trim())}
                  disabled={selectedRole.name === 'admin'}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    selectedRole.name === 'admin' ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRole(null);
                    setRoleName('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedRole.name === 'admin'}
                  className={`px-4 py-2 rounded-md ${
                    selectedRole.name === 'admin'
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete role <strong>{selectedRole.name}</strong>?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedRole(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={selectedRole.name === 'admin'}
                className={`px-4 py-2 rounded-md ${
                  selectedRole.name === 'admin'
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
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

export default RoleManagement;

