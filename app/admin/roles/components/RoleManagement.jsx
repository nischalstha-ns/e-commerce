"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { ShieldCheck, Store, User } from "lucide-react";

const ROLES = [
  {
    id: "admin",
    name: "Admin",
    icon: ShieldCheck,
    color: "danger",
    description: "Full control over the store: products, orders, users, settings and roles.",
    capabilities: [
      "Manage all products, categories and brands",
      "View and update all orders",
      "Assign roles to any user",
      "Manage homepage, collections and settings",
    ],
  },
  {
    id: "shop",
    name: "Shop",
    icon: Store,
    color: "warning",
    description: "Vendor account: manages its own products and sees its orders.",
    capabilities: [
      "Create and manage own products",
      "View orders for own products",
      "Manage shop profile",
    ],
  },
  {
    id: "customer",
    name: "Customer",
    icon: User,
    color: "default",
    description: "Default role for shoppers. Can browse, buy and track orders.",
    capabilities: [
      "Browse products and place orders",
      "Track own orders",
      "Manage profile and wishlist",
    ],
  },
];

export default function RoleManagement() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {ROLES.map((role) => {
        const Icon = role.icon;
        return (
          <Card key={role.id} className="border border-gray-200">
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={20} />
                  <h3 className="font-semibold text-lg">{role.name}</h3>
                </div>
                <Chip color={role.color} size="sm">
                  {role.id}
                </Chip>
              </div>
              <p className="text-sm text-gray-600">{role.description}</p>
              <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
                {role.capabilities.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
