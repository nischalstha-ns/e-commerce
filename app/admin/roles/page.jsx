"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button, Input, Switch, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Divider } from "@heroui/react";
import { Shield, Plus, Edit, Trash2, Copy, Users, Eye, Settings } from "lucide-react";
import AdminOnly from "../components/AdminOnly";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";
import toast from "react-hot-toast";

const defaultPermissions = {
  dashboard: { view: true, create: false, edit: false, delete: false },
  users: { view: false, create: false, edit: false, delete: false },
  products: { view: false, create: false, edit: false, delete: false },
  orders: { view: false, create: false, edit: false, delete: false },
  analytics: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, create: false, edit: false, delete: false }
};

const defaultRoles = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access",
    color: "primary",
    permissions: {
      dashboard: { view: true, create: true, edit: true, delete: true },
      users: { view: true, create: true, edit: true, delete: true },
      products: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: true, edit: true, delete: true },
      analytics: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, create: true, edit: true, delete: true }
    }
  },
  {
    id: "shop",
    name: "Shop Manager",
    description: "Product and order management",
    color: "warning",
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false },
      products: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: false, edit: true, delete: false },
      analytics: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    }
  },
  {
    id: "customer",
    name: "Customer",
    description: "Basic user access",
    color: "success",
    permissions: defaultPermissions
  }
];

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [userCounts, setUserCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const rolesRef = collection(db, "roles");
    const rolesQuery = query(rolesRef, orderBy("name"));
    
    const unsubscribeRoles = onSnapshot(rolesQuery, async (snapshot) => {
      const roleData = [];
      snapshot.forEach((doc) => {
        roleData.push({ id: doc.id, ...doc.data() });
      });
      
      if (roleData.length === 0) {
        for (const role of defaultRoles) {
          await setDoc(doc(db, "roles", role.id), role);
        }
        setRoles(defaultRoles);
      } else {
        setRoles(roleData);
      }
      setLoading(false);
    });

    const usersRef = collection(db, "users");
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      const counts = {};
      snapshot.forEach((doc) => {
        const userData = doc.data();
        const role = userData.role || "customer";
        counts[role] = (counts[role] || 0) + 1;
      });
      setUserCounts(counts);
    });

    return () => {
      unsubscribeRoles();
      unsubscribeUsers();
    };
  }, []);

  const handleSaveRole = async () => {
    if (!selectedRole.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      const roleData = {
        ...selectedRole,
        updatedAt: new Date().toISOString()
      };

      if (isEditing) {
        await updateDoc(doc(db, "roles", selectedRole.id), roleData);
        toast.success("Role updated successfully");
      } else {
        const roleId = selectedRole.name.toLowerCase().replace(/\s+/g, '-');
        await setDoc(doc(db, "roles", roleId), { ...roleData, id: roleId, createdAt: new Date().toISOString() });
        toast.success("Role created successfully");
      }
      
      onClose();
      setSelectedRole(null);
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save role");
      console.error(error);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (userCounts[roleId] > 0) {
      toast.error("Cannot delete role with assigned users");
      return;
    }

    try {
      await deleteDoc(doc(db, "roles", roleId));
      toast.success("Role deleted successfully");
    } catch (error) {
      toast.error("Failed to delete role");
      console.error(error);
    }
  };

  const handleCloneRole = (role) => {
    const clonedRole = {
      ...role,
      id: `${role.id}-copy`,
      name: `${role.name} Copy`,
      description: `Copy of ${role.description}`
    };
    setSelectedRole(clonedRole);
    setIsEditing(false);
    onOpen();
  };

  const updatePermission = (module, action, value) => {
    setSelectedRole(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: value
        }
      }
    }));
  };

  const openCreateModal = () => {
    setSelectedRole({
      name: "",
      description: "",
      color: "default",
      permissions: { ...defaultPermissions }
    });
    setIsEditing(false);
    onOpen();
  };

  const openEditModal = (role) => {
    setSelectedRole({ ...role });
    setIsEditing(true);
    onOpen();
  };

  if (loading) {
    return (
      <AdminOnly>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Role Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage user roles and permissions</p>
          </div>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={openCreateModal}
          >
            Create Role
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-lg">{role.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
                    </div>
                  </div>
                  <Chip
                    color={role.color || "default"}
                    variant="flat"
                    size="sm"
                  >
                    {role.id.toUpperCase()}
                  </Chip>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {userCounts[role.id] || 0} users assigned
                  </span>
                </div>

                <Divider className="my-4" />

                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-sm">Permissions</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(role.permissions || {}).map(([module, perms]) => {
                      const activePerms = Object.entries(perms).filter(([_, value]) => value).length;
                      return (
                        <div key={module} className="flex justify-between">
                          <span className="capitalize">{module}</span>
                          <span className="text-gray-500">{activePerms}/4</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Edit className="w-3 h-3" />}
                    onPress={() => openEditModal(role)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Copy className="w-3 h-3" />}
                    onPress={() => handleCloneRole(role)}
                  >
                    Clone
                  </Button>
                  {role.id !== "admin" && (
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      startContent={<Trash2 className="w-3 h-3" />}
                      onPress={() => handleDeleteRole(role.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader>
              {isEditing ? "Edit Role" : "Create New Role"}
            </ModalHeader>
            <ModalBody>
              {selectedRole && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Role Name"
                      value={selectedRole.name}
                      onChange={(e) => setSelectedRole({...selectedRole, name: e.target.value})}
                      placeholder="Enter role name"
                    />
                    <Input
                      label="Description"
                      value={selectedRole.description}
                      onChange={(e) => setSelectedRole({...selectedRole, description: e.target.value})}
                      placeholder="Enter role description"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Permissions</h3>
                    <div className="space-y-4">
                      {Object.entries(selectedRole.permissions || {}).map(([module, permissions]) => (
                        <Card key={module}>
                          <CardBody className="p-4">
                            <h4 className="font-medium capitalize mb-3">{module}</h4>
                            <div className="grid grid-cols-4 gap-4">
                              {Object.entries(permissions).map(([action, value]) => (
                                <div key={action} className="flex items-center justify-between">
                                  <span className="text-sm capitalize">{action}</span>
                                  <Switch
                                    size="sm"
                                    isSelected={value}
                                    onValueChange={(checked) => updatePermission(module, action, checked)}
                                  />
                                </div>
                              ))}
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>Cancel</Button>
              <Button color="primary" onPress={handleSaveRole}>
                {isEditing ? "Update Role" : "Create Role"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </AdminOnly>
  );
}