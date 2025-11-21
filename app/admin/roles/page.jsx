"use client";

import { useState } from "react";
import AdminOnly from "../components/AdminOnly";
import RoleManagement from "./components/RoleManagement";
import UserRoleAssignment from "./components/UserRoleAssignment";
import RolePermissions from "./components/RolePermissions";
import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import { Users, Shield, Settings } from "lucide-react";

export default function RolesPage() {
    return (
        <AdminOnly>
        <main className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                <p className="text-gray-600">Manage user roles and permissions</p>
            </div>

            <Tabs aria-label="Roles management tabs" className="w-full">
                <Tab 
                    key="users" 
                    title={
                        <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>User Roles</span>
                        </div>
                    }
                >
                    <Card>
                        <CardBody>
                            <UserRoleAssignment />
                        </CardBody>
                    </Card>
                </Tab>
                
                <Tab 
                    key="roles" 
                    title={
                        <div className="flex items-center gap-2">
                            <Shield size={16} />
                            <span>Role Management</span>
                        </div>
                    }
                >
                    <Card>
                        <CardBody>
                            <RoleManagement />
                        </CardBody>
                    </Card>
                </Tab>
                
                <Tab 
                    key="permissions" 
                    title={
                        <div className="flex items-center gap-2">
                            <Settings size={16} />
                            <span>Permissions</span>
                        </div>
                    }
                >
                    <Card>
                        <CardBody>
                            <RolePermissions />
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </main>
        </AdminOnly>
    );
}