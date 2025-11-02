import React, { useState, useEffect } from "react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { userService } from "../services/userService";
import { roleService } from "../services/roleService";
import type { User, Role, UpdateUserRequest } from "../types";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    lastName: "",
    chileanRutNumber: "",
    color: "#3285a8",
    password: "",
    confirmPassword: "",
    roleIds: [] as number[],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUser && !isEditMode) {
      setFormData({
        username: selectedUser.username || "",
        email: selectedUser.email || "",
        name: selectedUser.name || "",
        lastName: selectedUser.lastName || "",
        chileanRutNumber: selectedUser.chileanRutNumber || "",
        color: selectedUser.color || "#3285a8",
        password: "",
        confirmPassword: "",
        roleIds: roles.filter((r) => selectedUser.roles.includes(r.name)).map((r) => r.id),
      });
    }
  }, [selectedUser, isEditMode, roles]);

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
      setError(err.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const openUserDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(false);
    setOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeDialog = () => {
    setOpen(false);
    setSelectedUser(null);
    setIsEditMode(false);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    if (selectedUser) {
      setFormData({
        username: selectedUser.username || "",
        email: selectedUser.email || "",
        name: selectedUser.name || "",
        lastName: selectedUser.lastName || "",
        chileanRutNumber: selectedUser.chileanRutNumber || "",
        color: selectedUser.color || "#3285a8",
        password: "",
        confirmPassword: "",
        roleIds: roles.filter((r) => selectedUser.roles.includes(r.name)).map((r) => r.id),
      });
    }
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      setError(null);

      // Update basic user info including color
      const updateData: UpdateUserRequest = {
        username: formData.username,
        email: formData.email,
        name: formData.name,
        lastName: formData.lastName,
        chileanRutNumber: formData.chileanRutNumber,
        color: formData.color,
      };
      await userService.updateUser(selectedUser.id, updateData);

      // Update password if provided
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        await userService.changeUserPassword(selectedUser.id, formData.password);
      }

      // Update roles
      await userService.changeUserRoles(selectedUser.id, formData.roleIds);

      setSuccess("User updated successfully");
      setIsEditMode(false);
      await loadData();
      // Refresh selected user from updated list
      const updatedUsers = await userService.getAllUsers();
      const updatedUser = updatedUsers.users.find((u) => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update user");
    }
  };

  const getInitials = (name?: string, lastName?: string): string => {
    const firstInitial = name?.charAt(0)?.toUpperCase() || "";
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || "";
    return firstInitial + lastInitial || "U";
  };

  const formatLastLogin = (lastLogin?: string): { text: string; isRecentlyActive: boolean } => {
    if (!lastLogin) {
      return { text: "Never logged in", isRecentlyActive: false };
    }

    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 15) {
      return { text: "Recently active", isRecentlyActive: true };
    }

    if (diffInMinutes < 60) {
      return { text: `${diffInMinutes}m ago`, isRecentlyActive: false };
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return { text: `${diffInHours}h ago`, isRecentlyActive: false };
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return { text: `${diffInDays}d ago`, isRecentlyActive: false };
    }

    return { text: lastLoginDate.toLocaleDateString(), isRecentlyActive: false };
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
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
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

      <ul
        role="list"
        className="divide-y divide-gray-100 overflow-hidden bg-white shadow-xs outline-1 outline-gray-900/5 sm:rounded-xl"
      >
        {users.map((user) => {
          const { text: lastLoginText, isRecentlyActive } = formatLastLogin(user.lastLogin);
          const userColor = user.color || "#3285a8";

          return (
            <li key={user.id} className="relative py-5 hover:bg-gray-50">
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-4xl justify-between gap-x-6">
                  <div className="flex min-w-0 gap-x-4">
                    <div
                      className="size-12 flex-none rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: userColor }}
                    >
                      {getInitials(user.name, user.lastName)}
                    </div>
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm/6 font-semibold text-gray-900">
                        {user.name} {user.lastName}
                      </p>
                      <p className="mt-1 flex text-xs/5 text-gray-500">
                        <a href={`mailto:${user.email}`} className="relative truncate hover:underline">
                          {user.email}
                        </a>
                      </p>
                      <p className="mt-1 text-xs text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-x-4">
                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                      <div className="flex flex-wrap gap-1.5 justify-end mb-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                      {isRecentlyActive ? (
                        <div className="flex items-center gap-x-1.5">
                          <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                            <div className="size-1.5 rounded-full bg-emerald-500" />
                          </div>
                          <p className="text-xs/5 text-gray-500">{lastLoginText}</p>
                        </div>
                      ) : (
                        <p className="text-xs/5 text-gray-500">{lastLoginText}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openUserDialog(user);
                      }}
                      className="cursor-pointer hover:text-gray-600"
                    >
                      <ChevronRightIcon aria-hidden={true} className="size-5 flex-none text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog open={open} onClose={closeDialog} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="divide-y divide-gray-900/10">
                {selectedUser && (
                  <>
                    {/* Profile Section */}
                    <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
                      <div className="px-4 sm:px-0">
                        <h2 className="text-base/7 font-semibold text-gray-900">Profile</h2>
                        <p className="mt-1 text-sm/6 text-gray-600">User profile information and settings.</p>
                      </div>
                      <form className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl md:col-span-2">
                        <div className="px-4 py-6 sm:p-8">
                          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                              <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                                Username
                              </label>
                              <div className="mt-2">
                                {isEditMode ? (
                                  <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{formData.username}</p>
                                )}
                              </div>
                            </div>

                            <div className="col-span-full">
                              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                Email
                              </label>
                              <div className="mt-2">
                                {isEditMode ? (
                                  <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{formData.email}</p>
                                )}
                              </div>
                            </div>

                            <div className="col-span-full">
                              <label htmlFor="avatar" className="block text-sm/6 font-medium text-gray-900">
                                Avatar Color
                              </label>
                              <div className="mt-2 flex items-center gap-x-3">
                                <div
                                  className="size-12 flex-none rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                  style={{ backgroundColor: formData.color }}
                                >
                                  {getInitials(formData.name, formData.lastName)}
                                </div>
                                {isEditMode ? (
                                  <input
                                    id="color"
                                    name="color"
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                                  />
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Personal Information Section */}
                    <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
                      <div className="px-4 sm:px-0">
                        <h2 className="text-base/7 font-semibold text-gray-900">Personal Information</h2>
                        <p className="mt-1 text-sm/6 text-gray-600">User's personal details.</p>
                      </div>
                      <form className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl md:col-span-2">
                        <div className="px-4 py-6 sm:p-8">
                          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                              <label htmlFor="first-name" className="block text-sm/6 font-medium text-gray-900">
                                First name
                              </label>
                              <div className="mt-2">
                                {isEditMode ? (
                                  <input
                                    id="first-name"
                                    name="first-name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{formData.name || "N/A"}</p>
                                )}
                              </div>
                            </div>
                            <div className="sm:col-span-3">
                              <label htmlFor="last-name" className="block text-sm/6 font-medium text-gray-900">
                                Last name
                              </label>
                              <div className="mt-2">
                                {isEditMode ? (
                                  <input
                                    id="last-name"
                                    name="last-name"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{formData.lastName || "N/A"}</p>
                                )}
                              </div>
                            </div>
                            <div className="sm:col-span-3">
                              <label htmlFor="rut" className="block text-sm/6 font-medium text-gray-900">
                                Chilean RUT Number
                              </label>
                              <div className="mt-2">
                                {isEditMode ? (
                                  <input
                                    id="rut"
                                    name="rut"
                                    type="text"
                                    value={formData.chileanRutNumber}
                                    onChange={(e) => setFormData({ ...formData, chileanRutNumber: e.target.value })}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{formData.chileanRutNumber || "N/A"}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Security & Roles Section */}
                    <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
                      <div className="px-4 sm:px-0">
                        <h2 className="text-base/7 font-semibold text-gray-900">Security & Roles</h2>
                        <p className="mt-1 text-sm/6 text-gray-600">Manage password and user roles.</p>
                      </div>
                      <form className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl md:col-span-2">
                        <div className="px-4 py-6 sm:p-8">
                          <div className="max-w-2xl space-y-6">
                            {isEditMode && (
                              <>
                                <div>
                                  <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                    New Password (leave blank to keep current)
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      id="password"
                                      name="password"
                                      type="password"
                                      value={formData.password}
                                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label htmlFor="confirm-password" className="block text-sm/6 font-medium text-gray-900">
                                    Confirm Password
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      id="confirm-password"
                                      name="confirm-password"
                                      type="password"
                                      value={formData.confirmPassword}
                                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                            <fieldset>
                              <legend className="text-sm/6 font-semibold text-gray-900">Roles</legend>
                              <div className="mt-6 space-y-6">
                                {roles.map((role) => (
                                  <div key={role.id} className="flex gap-3">
                                    <div className="flex h-6 shrink-0 items-center">
                                      <div className="group grid size-4 grid-cols-1">
                                        <input
                                          id={`role-${role.id}`}
                                          name={`role-${role.id}`}
                                          type="checkbox"
                                          checked={formData.roleIds.includes(role.id)}
                                          onChange={(e) => {
                                            if (isEditMode) {
                                              if (e.target.checked) {
                                                setFormData({ ...formData, roleIds: [...formData.roleIds, role.id] });
                                              } else {
                                                setFormData({
                                                  ...formData,
                                                  roleIds: formData.roleIds.filter((id) => id !== role.id),
                                                });
                                              }
                                            }
                                          }}
                                          disabled={!isEditMode}
                                          className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100"
                                        />
                                        <svg
                                          fill="none"
                                          viewBox="0 0 14 14"
                                          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                                        >
                                          <path
                                            d="M3 8L6 11L11 3.5"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="opacity-0 group-has-checked:opacity-100"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                    <div className="text-sm/6">
                                      <label htmlFor={`role-${role.id}`} className="font-medium text-gray-900">
                                        {role.name}
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </fieldset>
                            {!isEditMode && (
                              <div className="space-y-2 text-sm">
                                <p>
                                  <span className="font-medium">Created:</span> {formatDate(selectedUser.createdAt)}
                                </p>
                                <p>
                                  <span className="font-medium">Last Login:</span> {formatLastLogin(selectedUser.lastLogin).text}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                          <button
                            type="button"
                            onClick={isEditMode ? handleCancel : closeDialog}
                            className="text-sm/6 font-semibold text-gray-900"
                          >
                            {isEditMode ? "Cancel" : "Close"}
                          </button>
                          {isEditMode ? (
                            <button
                              type="button"
                              onClick={handleSave}
                              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleEdit}
                              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </div>

              {(error || success) && (
                <div className="px-4 sm:px-8 pb-4">
                  {error && <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>}
                  {success && <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">{success}</div>}
                </div>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default UserManagement;
