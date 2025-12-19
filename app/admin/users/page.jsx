"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Button, Input, Select, SelectItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Pagination } from "@heroui/react";
import { Search, Filter, MoreVertical, UserPlus, Download, Eye, Edit, Trash2, Shield, Clock, MapPin } from "lucide-react";
import AdminOnly from "../components/AdminOnly";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";

const statusColorMap = {
  active: "success",
  suspended: "warning", 
  banned: "danger",
  pending: "default"
};

const roleColorMap = {
  "super-admin": "danger",
  "admin": "primary",
  "manager": "secondary",
  "staff": "default",
  "vendor": "warning",
  "customer": "success"
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [page, setPage] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);

  const rowsPerPage = 10;

  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const isOnline = data.lastActivity && (Date.now() - new Date(data.lastActivity).getTime()) < 300000; // 5 minutes
        userData.push({ id: doc.id, ...data, isOnline });
      });
      setUsers(userData);
      setLoading(false);
    });

    // Track online users
    const onlineRef = collection(db, "userSessions");
    const onlineUnsubscribe = onSnapshot(onlineRef, (snapshot) => {
      const online = new Set();
      snapshot.forEach((doc) => {
        const session = doc.data();
        if (session.status === "active" && (Date.now() - new Date(session.lastActivity).getTime()) < 300000) {
          online.add(session.userId);
        }
      });
      setOnlineUsers(online);
    });

    return () => {
      unsubscribe();
      onlineUnsubscribe();
    };
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setPage(1);
  }, [users, searchTerm, statusFilter, roleFilter]);

  const handleBulkAction = async (action) => {
    const selectedUserIds = Array.from(selectedUsers);
    
    try {
      const promises = selectedUserIds.map(userId => {
        const userRef = doc(db, "users", userId);
        switch (action) {
          case "activate":
            return updateDoc(userRef, { status: "active", updatedAt: new Date().toISOString() });
          case "suspend":
            return updateDoc(userRef, { status: "suspended", updatedAt: new Date().toISOString() });
          case "delete":
            return deleteDoc(userRef);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      toast.success(`${action} completed for ${selectedUserIds.length} users`);
      setSelectedUsers(new Set());
    } catch (error) {
      toast.error(`Failed to ${action} users`);
      console.error(error);
    }
  };

  const logAdminAction = async (action, targetUserId, details) => {
    try {
      await addDoc(collection(db, "adminActions"), {
        adminId: currentUser?.uid,
        adminEmail: currentUser?.email,
        action,
        targetUserId,
        details,
        timestamp: serverTimestamp(),
        ipAddress: await getClientIP()
      });
    } catch (error) {
      console.error("Failed to log admin action:", error);
    }
  };

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'Unknown';
    }
  };

  const handleUserAction = async (userId, action, value = null) => {
    try {
      const userRef = doc(db, "users", userId);
      const targetUser = users.find(u => u.id === userId);
      
      switch (action) {
        case "updateStatus":
          await updateDoc(userRef, { status: value, updatedAt: new Date().toISOString() });
          await logAdminAction("status_change", userId, { from: targetUser?.status, to: value });
          toast.success("User status updated");
          break;
        case "updateRole":
          await updateDoc(userRef, { role: value, updatedAt: new Date().toISOString() });
          await logAdminAction("role_change", userId, { from: targetUser?.role, to: value });
          toast.success("User role updated");
          break;
        case "delete":
          await deleteDoc(userRef);
          await logAdminAction("user_delete", userId, { email: targetUser?.email });
          toast.success("User deleted");
          break;
      }
    } catch (error) {
      toast.error("Action failed");
      console.error(error);
    }
  };

  const renderCell = (user, columnKey) => {
    switch (columnKey) {
      case "user":
        return (
          <div className="flex items-center gap-3">
            <div className="relative">
              <User
                avatarProps={{ src: user.photoURL, size: "sm" }}
                name={user.displayName || "Unknown User"}
                description={user.email}
              />
              {(onlineUsers.has(user.id) || user.isOnline) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
          </div>
        );
      case "role":
        return (
          <Chip
            color={roleColorMap[user.role] || "default"}
            size="sm"
            variant="flat"
          >
            {user.role?.replace("-", " ").toUpperCase() || "CUSTOMER"}
          </Chip>
        );
      case "status":
        return (
          <Chip
            color={statusColorMap[user.status] || "default"}
            size="sm"
            variant="dot"
          >
            {user.status?.toUpperCase() || "ACTIVE"}
          </Chip>
        );
      case "lastLogin":
        return (
          <div className="flex flex-col">
            <span className="text-sm">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
            </span>
            <span className="text-xs text-gray-500">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : ""}
            </span>
          </div>
        );
      case "createdAt":
        return (
          <span className="text-sm">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
          </span>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Button
              as={Link}
              href={`/admin/users/${user.id}`}
              size="sm"
              variant="flat"
              startContent={<Eye className="w-4 h-4" />}
            >
              View
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button size="sm" variant="flat" isIconOnly>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="w-4 h-4" />}
                  onPress={() => {
                    setSelectedUser(user);
                    onOpen();
                  }}
                >
                  Edit User
                </DropdownItem>
                <DropdownItem
                  key="suspend"
                  startContent={<Shield className="w-4 h-4" />}
                  onPress={() => handleUserAction(user.id, "updateStatus", user.status === "active" ? "suspended" : "active")}
                >
                  {user.status === "active" ? "Suspend" : "Activate"}
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<Trash2 className="w-4 h-4" />}
                  onPress={() => handleUserAction(user.id, "delete")}
                >
                  Delete User
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return user[columnKey];
    }
  };

  const paginatedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <AdminOnly>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage users, roles, and permissions</p>
          </div>
          <div className="flex gap-3">
            <Button
              startContent={<Download className="w-4 h-4" />}
              variant="bordered"
            >
              Export
            </Button>
            <Button
              as={Link}
              href="/admin/roles"
              color="primary"
              startContent={<Shield className="w-4 h-4" />}
            >
              Manage Roles
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            className="sm:max-w-xs"
          />
          <Select
            placeholder="Filter by status"
            selectedKeys={statusFilter !== "all" ? [statusFilter] : []}
            onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] || "all")}
            className="sm:max-w-xs"
          >
            <SelectItem key="all">All Status</SelectItem>
            <SelectItem key="active">Active</SelectItem>
            <SelectItem key="suspended">Suspended</SelectItem>
            <SelectItem key="banned">Banned</SelectItem>
          </Select>
          <Select
            placeholder="Filter by role"
            selectedKeys={roleFilter !== "all" ? [roleFilter] : []}
            onSelectionChange={(keys) => setRoleFilter(Array.from(keys)[0] || "all")}
            className="sm:max-w-xs"
          >
            <SelectItem key="all">All Roles</SelectItem>
            <SelectItem key="admin">Admin</SelectItem>
            <SelectItem key="shop">Shop</SelectItem>
            <SelectItem key="customer">Customer</SelectItem>
          </Select>
        </div>

        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm font-medium">{selectedUsers.size} users selected</span>
            <Button size="sm" onPress={() => handleBulkAction("activate")}>Activate</Button>
            <Button size="sm" onPress={() => handleBulkAction("suspend")}>Suspend</Button>
            <Button size="sm" color="danger" onPress={() => handleBulkAction("delete")}>Delete</Button>
          </div>
        )}

        <Table
          selectionMode="multiple"
          selectedKeys={selectedUsers}
          onSelectionChange={setSelectedUsers}
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={Math.ceil(filteredUsers.length / rowsPerPage)}
                onChange={setPage}
              />
            </div>
          }
        >
          <TableHeader>
            <TableColumn key="user">USER</TableColumn>
            <TableColumn key="role">ROLE</TableColumn>
            <TableColumn key="status">STATUS</TableColumn>
            <TableColumn key="lastLogin">LAST LOGIN</TableColumn>
            <TableColumn key="createdAt">REGISTERED</TableColumn>
            <TableColumn key="actions">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody
            items={paginatedUsers}
            isLoading={loading}
            emptyContent="No users found"
          >
            {(user) => (
              <TableRow key={user.id}>
                {(columnKey) => <TableCell>{renderCell(user, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <ModalHeader>Edit User</ModalHeader>
            <ModalBody>
              {selectedUser && (
                <div className="space-y-4">
                  <Input
                    label="Display Name"
                    value={selectedUser.displayName || ""}
                    onChange={(e) => setSelectedUser({...selectedUser, displayName: e.target.value})}
                  />
                  <Input
                    label="Email"
                    value={selectedUser.email || ""}
                    isReadOnly
                  />
                  <Select
                    label="Role"
                    selectedKeys={[selectedUser.role || "customer"]}
                    onSelectionChange={(keys) => setSelectedUser({...selectedUser, role: Array.from(keys)[0]})}
                  >
                    <SelectItem key="admin">Admin</SelectItem>
                    <SelectItem key="shop">Shop</SelectItem>
                    <SelectItem key="customer">Customer</SelectItem>
                  </Select>
                  <Select
                    label="Status"
                    selectedKeys={[selectedUser.status || "active"]}
                    onSelectionChange={(keys) => setSelectedUser({...selectedUser, status: Array.from(keys)[0]})}
                  >
                    <SelectItem key="active">Active</SelectItem>
                    <SelectItem key="suspended">Suspended</SelectItem>
                    <SelectItem key="banned">Banned</SelectItem>
                  </Select>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>Cancel</Button>
              <Button
                color="primary"
                onPress={async () => {
                  await handleUserAction(selectedUser.id, "updateRole", selectedUser.role);
                  await handleUserAction(selectedUser.id, "updateStatus", selectedUser.status);
                  onClose();
                }}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </AdminOnly>
  );
}