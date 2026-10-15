"use client";

import { useState } from "react";
import { db } from "@/lib/firestore/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useUsers } from "@/lib/firestore/users/read";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Select, SelectItem, Chip, Spinner,
} from "@heroui/react";
import toast from "react-hot-toast";

const ROLES = ["customer", "shop", "admin"];
const ROLE_COLORS = { admin: "danger", shop: "warning", customer: "default" };

export default function UserRoleAssignment() {
  const { data: users, isLoading } = useUsers();
  const [saving, setSaving] = useState(null);

  const changeRole = async (userId, newRole) => {
    if (!db) {
      toast.error("Database unavailable");
      return;
    }
    setSaving(userId);
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Role updated");
    } catch (e) {
      toast.error(e.message || "Failed to update role");
    } finally {
      setSaving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner label="Loading users..." />
      </div>
    );
  }

  if (!users || users.length === 0) {
    return <p className="text-gray-500 py-4">No users found.</p>;
  }

  return (
    <Table aria-label="User role assignment">
      <TableHeader>
        <TableColumn>USER</TableColumn>
        <TableColumn>CURRENT ROLE</TableColumn>
        <TableColumn>ASSIGN ROLE</TableColumn>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell>
              <div>
                <p className="font-medium">{u.displayName || u.name || "—"}</p>
                <p className="text-sm text-gray-500">{u.email || u.id}</p>
              </div>
            </TableCell>
            <TableCell>
              <Chip color={ROLE_COLORS[u.role] || "default"} size="sm">
                {u.role || "customer"}
              </Chip>
            </TableCell>
            <TableCell>
              <Select
                aria-label={`Role for ${u.email || u.id}`}
                size="sm"
                className="w-36"
                selectedKeys={new Set([u.role || "customer"])}
                isDisabled={saving === u.id}
                onSelectionChange={(keys) => {
                  const next = Array.from(keys)[0];
                  if (next && next !== (u.role || "customer")) changeRole(u.id, next);
                }}
              >
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
