"use client";

import { useUsers } from "@/lib/firestore/users/read";
import { updateUserRole, deleteUser } from "@/lib/firestore/users/write";
import { Button, CircularProgress, Chip, Select, SelectItem, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { User, Shield, Trash2, Edit, Search, UserCheck, UserX, Crown } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function UserManagement() {
    const { data: users, error, isLoading } = useUsers();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    // Filter users based on search term and role filter
    const filteredUsers = users?.filter(user => {
        const matchesSearch = !searchTerm || 
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = !roleFilter || user.role === roleFilter;
        
        return matchesSearch && matchesRole;
    }) || [];

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole({ uid: userId, role: newRole });
            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            toast.error(error?.message || "Error updating user role");
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        onEditOpen();
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        onDeleteOpen();
    };

    const confirmDeleteUser = async () => {
        if (!selectedUser) return;
        
        try {
            await deleteUser({ uid: selectedUser.id });
            toast.success("User deleted successfully");
            onDeleteClose();
            setSelectedUser(null);
        } catch (error) {
            toast.error(error?.message || "Error deleting user");
        }
    };

    const getUserStats = () => {
        const total = users?.length || 0;
        const admins = users?.filter(user => user.role === "admin").length || 0;
        const customers = users?.filter(user => user.role === "customer" || !user.role).length || 0;
        
        return { total, admins, customers };
    };

    const stats = getUserStats();

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="bg-white dark:bg-[#242424] p-3 md:p-6 rounded-lg md:rounded-xl shadow-sm border border-gray-100 dark:border-[#3a3a3a] theme-transition">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                            <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                        <div className="hidden md:block p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#242424] p-3 md:p-6 rounded-lg md:rounded-xl shadow-sm border border-gray-100 dark:border-[#3a3a3a] theme-transition">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-400 mb-1">Admins</p>
                            <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{stats.admins}</p>
                        </div>
                        <div className="hidden md:block p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                            <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#242424] p-3 md:p-6 rounded-lg md:rounded-xl shadow-sm border border-gray-100 dark:border-[#3a3a3a] theme-transition">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-400 mb-1">Customers</p>
                            <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{stats.customers}</p>
                        </div>
                        <div className="hidden md:block p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                            <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-3 md:p-6 shadow-sm border border-gray-100 dark:border-[#3a3a3a] theme-transition">
                <div className="grid grid-cols-2 gap-2 md:flex md:gap-4 mb-4 md:mb-6">
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        startContent={<Search size={16} />}
                        variant="bordered"
                        className="col-span-1 md:flex-1"
                        classNames={{
                            input: "dark:text-white",
                            inputWrapper: "dark:bg-[#242424] dark:border-[#3a3a3a]"
                        }}
                    />
                    <Select
                        placeholder="Filter by Role"
                        selectedKeys={roleFilter ? [roleFilter] : []}
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0];
                            setRoleFilter(selectedKey || "");
                        }}
                        variant="bordered"
                        className="col-span-1 md:w-48"
                        classNames={{
                            trigger: "dark:bg-[#242424] dark:border-[#3a3a3a]",
                            value: "dark:text-white"
                        }}
                    >
                        <SelectItem key="admin" value="admin">Administrators</SelectItem>
                        <SelectItem key="customer" value="customer">Customers</SelectItem>
                    </Select>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden space-y-3">
                    {filteredUsers.map((user) => (
                        <UserCard 
                            key={user.id} 
                            user={user} 
                            onRoleChange={handleRoleChange}
                            onEdit={handleEditUser}
                            onDelete={handleDeleteUser}
                        />
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-[#242424]">
                                <th className="px-4 py-3 text-left rounded-l-lg dark:text-gray-300">User</th>
                                <th className="px-4 py-3 text-left dark:text-gray-300">Email</th>
                                <th className="px-4 py-3 text-left dark:text-gray-300">Role</th>
                                <th className="px-4 py-3 text-left dark:text-gray-300">Status</th>
                                <th className="px-4 py-3 text-left dark:text-gray-300">Joined</th>
                                <th className="px-4 py-3 text-left rounded-r-lg dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <UserRow 
                                    key={user.id} 
                                    user={user} 
                                    onRoleChange={handleRoleChange}
                                    onEdit={handleEditUser}
                                    onDelete={handleDeleteUser}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        {searchTerm || roleFilter ? "No users found matching your criteria" : "No users found"}
                    </div>
                )}
            </div>

            {/* Edit User Modal */}
            <EditUserModal 
                isOpen={isEditOpen}
                onClose={onEditClose}
                user={selectedUser}
                onRoleChange={handleRoleChange}
            />

            {/* Delete User Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                <ModalContent>
                    <ModalHeader>Delete User</ModalHeader>
                    <ModalBody>
                        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                        {selectedUser && (
                            <div className="mt-4 p-4 bg-red-50 rounded-lg">
                                <p className="font-medium">{selectedUser.displayName || "Unknown User"}</p>
                                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onDeleteClose}>
                            Cancel
                        </Button>
                        <Button color="danger" onPress={confirmDeleteUser}>
                            Delete User
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}

function UserCard({ user, onRoleChange, onEdit, onDelete }) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleRoleUpdate = async (newRole) => {
        setIsUpdating(true);
        await onRoleChange(user.id, newRole);
        setIsUpdating(false);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString();
    };

    const getRoleColor = (role) => {
        switch (role) {
            case "admin": return "purple";
            case "customer": return "blue";
            default: return "default";
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case "admin": return <Crown size={12} />;
            case "customer": return <User size={12} />;
            default: return <User size={12} />;
        }
    };

    return (
        <div className="bg-white dark:bg-[#242424] rounded-lg p-4 shadow-sm border border-gray-100 dark:border-[#3a3a3a] theme-transition">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#3a3a3a] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                        <User size={24} className="text-gray-500 dark:text-gray-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{user.displayName || "Unknown User"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">ID: {user.id.slice(0, 8)}...</p>
                </div>
                <div className="flex flex-col gap-1">
                    <Chip 
                        color={getRoleColor(user.role)} 
                        size="sm" 
                        className="capitalize"
                        startContent={getRoleIcon(user.role)}
                    >
                        {user.role || "customer"}
                    </Chip>
                </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-[#3a3a3a] mb-3">
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <Chip 
                        color={user.emailVerified ? "success" : "warning"} 
                        size="sm"
                        className="mt-1"
                    >
                        {user.emailVerified ? "Verified" : "Unverified"}
                    </Chip>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
                    <p className="text-sm font-medium dark:text-white mt-1">{formatDate(user.timestampCreate)}</p>
                </div>
            </div>

            <div className="flex gap-2">
                <Select
                    size="sm"
                    placeholder="Change Role"
                    className="flex-1"
                    selectedKeys={user.role ? [user.role] : ["customer"]}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        if (selectedKey && selectedKey !== user.role) {
                            handleRoleUpdate(selectedKey);
                        }
                    }}
                    isDisabled={isUpdating}
                    classNames={{
                        trigger: "dark:bg-[#1a1a1a] dark:border-[#3a3a3a]",
                        value: "dark:text-white"
                    }}
                >
                    <SelectItem key="customer" value="customer">Customer</SelectItem>
                    <SelectItem key="admin" value="admin">Admin</SelectItem>
                </Select>
                
                <Button
                    onClick={() => onEdit(user)}
                    isIconOnly
                    size="sm"
                    variant="flat"
                >
                    <Edit size={16} />
                </Button>
                
                <Button
                    onClick={() => onDelete(user)}
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="flat"
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    );
}

function UserRow({ user, onRoleChange, onEdit, onDelete }) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleRoleUpdate = async (newRole) => {
        setIsUpdating(true);
        await onRoleChange(user.id, newRole);
        setIsUpdating(false);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString();
    };

    const getRoleColor = (role) => {
        switch (role) {
            case "admin": return "purple";
            case "customer": return "blue";
            default: return "default";
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case "admin": return <Crown size={12} />;
            case "customer": return <User size={12} />;
            default: return <User size={12} />;
        }
    };

    return (
        <tr className="bg-white dark:bg-[#242424] shadow-sm theme-transition">
            <td className="px-4 py-3 rounded-l-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} className="text-gray-500" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium dark:text-white">{user.displayName || "Unknown User"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id.slice(0, 8)}...</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm dark:text-gray-300">{user.email}</span>
            </td>
            <td className="px-4 py-3">
                <Chip 
                    color={getRoleColor(user.role)} 
                    size="sm" 
                    className="capitalize"
                    startContent={getRoleIcon(user.role)}
                >
                    {user.role || "customer"}
                </Chip>
            </td>
            <td className="px-4 py-3">
                <Chip 
                    color={user.emailVerified ? "success" : "warning"} 
                    size="sm"
                >
                    {user.emailVerified ? "Verified" : "Unverified"}
                </Chip>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm dark:text-gray-300">{formatDate(user.timestampCreate)}</span>
            </td>
            <td className="px-4 py-3 rounded-r-lg">
                <div className="flex gap-2">
                    <Select
                        size="sm"
                        placeholder="Change Role"
                        className="w-32"
                        selectedKeys={user.role ? [user.role] : ["customer"]}
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0];
                            if (selectedKey && selectedKey !== user.role) {
                                handleRoleUpdate(selectedKey);
                            }
                        }}
                        isDisabled={isUpdating}
                    >
                        <SelectItem key="customer" value="customer">Customer</SelectItem>
                        <SelectItem key="admin" value="admin">Admin</SelectItem>
                    </Select>
                    
                    <Button
                        onClick={() => onEdit(user)}
                        isIconOnly
                        size="sm"
                        variant="light"
                    >
                        <Edit size={16} />
                    </Button>
                    
                    <Button
                        onClick={() => onDelete(user)}
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="light"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </td>
        </tr>
    );
}

function EditUserModal({ isOpen, onClose, user, onRoleChange }) {
    const [formData, setFormData] = useState({
        displayName: "",
        role: "customer"
    });
    const [isUpdating, setIsUpdating] = useState(false);

    useState(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || "",
                role: user.role || "customer"
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        
        setIsUpdating(true);
        try {
            if (formData.role !== user.role) {
                await onRoleChange(user.id, formData.role);
            }
            toast.success("User updated successfully");
            onClose();
        } catch (error) {
            toast.error("Error updating user");
        }
        setIsUpdating(false);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleString();
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader>User Details</ModalHeader>
                <ModalBody>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} className="text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-lg dark:text-white">{user.displayName || "Unknown User"}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                                <Chip color={user.role === "admin" ? "purple" : "blue"} size="sm" className="mt-1">
                                    {user.role || "customer"}
                                </Chip>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">User ID</p>
                                <p className="text-sm font-mono dark:text-white break-all">{user.id}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email Status</p>
                                <Chip color={user.emailVerified ? "success" : "warning"} size="sm">
                                    {user.emailVerified ? "Verified" : "Unverified"}
                                </Chip>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold dark:text-white">Account Information</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Created At</span>
                                    <span className="text-sm font-medium dark:text-white">{formatDate(user.timestampCreate)}</span>
                                </div>
                                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                                    <span className="text-sm font-medium dark:text-white">{formatDate(user.timestampUpdate)}</span>
                                </div>
                                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Login</span>
                                    <span className="text-sm font-medium dark:text-white">{formatDate(user.lastLoginAt)}</span>
                                </div>
                                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Verification Status</span>
                                    <span className="text-sm font-medium dark:text-white">{user.isVerified ? "Verified" : "Not Verified"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold dark:text-white">Role Management</h4>
                            <Select
                                label="User Role"
                                selectedKeys={[formData.role]}
                                onSelectionChange={(keys) => {
                                    const selectedKey = Array.from(keys)[0];
                                    setFormData(prev => ({ ...prev, role: selectedKey }));
                                }}
                                variant="bordered"
                                classNames={{
                                    trigger: "dark:bg-gray-800 dark:border-gray-700",
                                    value: "dark:text-white"
                                }}
                            >
                                <SelectItem key="customer" value="customer">Customer</SelectItem>
                                <SelectItem key="admin" value="admin">Administrator</SelectItem>
                            </Select>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <strong>Warning:</strong> Changing role affects access permissions immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        color="primary" 
                        onPress={handleSave}
                        isLoading={isUpdating}
                    >
                        Save Changes
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}