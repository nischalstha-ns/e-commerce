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
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Administrators</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100">
                            <Crown className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Customers</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.customers}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            startContent={<Search size={16} />}
                            variant="bordered"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <Select
                            placeholder="Filter by Role"
                            selectedKeys={roleFilter ? [roleFilter] : []}
                            onSelectionChange={(keys) => {
                                const selectedKey = Array.from(keys)[0];
                                setRoleFilter(selectedKey || "");
                            }}
                            variant="bordered"
                        >
                            <SelectItem key="admin" value="admin">Administrators</SelectItem>
                            <SelectItem key="customer" value="customer">Customers</SelectItem>
                        </Select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left rounded-l-lg">User</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">Role</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Joined</th>
                                <th className="px-4 py-3 text-left rounded-r-lg">Actions</th>
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
                    <div className="text-center py-8 text-gray-500">
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
        <tr className="bg-white shadow-sm">
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
                        <p className="font-medium">{user.displayName || "Unknown User"}</p>
                        <p className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm">{user.email}</span>
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
                <span className="text-sm">{formatDate(user.timestampCreate)}</span>
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
            // Update role if changed
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

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>Edit User</ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={24} className="text-gray-500" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium">{user.displayName || "Unknown User"}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                        </div>

                        <Input
                            label="Display Name"
                            value={formData.displayName}
                            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                            variant="bordered"
                            isDisabled
                            description="Display name cannot be changed from admin panel"
                        />

                        <Select
                            label="Role"
                            selectedKeys={[formData.role]}
                            onSelectionChange={(keys) => {
                                const selectedKey = Array.from(keys)[0];
                                setFormData(prev => ({ ...prev, role: selectedKey }));
                            }}
                            variant="bordered"
                        >
                            <SelectItem key="customer" value="customer">Customer</SelectItem>
                            <SelectItem key="admin" value="admin">Administrator</SelectItem>
                        </Select>

                        <div className="bg-yellow-50 p-3 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> Changing a user's role will immediately affect their access permissions.
                            </p>
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