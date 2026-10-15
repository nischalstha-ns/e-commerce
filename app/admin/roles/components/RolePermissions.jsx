"use client";

import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
} from "@heroui/react";
import { Check, X } from "lucide-react";

const AREAS = [
  "Browse products",
  "Place orders",
  "Manage own products",
  "Manage categories & brands",
  "View all orders",
  "Update order status",
  "Manage users & roles",
  "Manage settings & homepage",
];

const MATRIX = {
  customer: [true, true, false, false, false, false, false, false],
  shop: [true, true, true, false, false, true, false, false],
  admin: [true, true, true, true, true, true, true, true],
};

function Mark({ allowed }) {
  return allowed ? (
    <Check size={18} className="text-green-600 mx-auto" />
  ) : (
    <X size={18} className="text-gray-300 mx-auto" />
  );
}

export default function RolePermissions() {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        What each role is allowed to do. Enforced by Firestore security rules
        and the API layer — this table is a reference.
      </p>
      <Table aria-label="Permission matrix">
        <TableHeader>
          <TableColumn>CAPABILITY</TableColumn>
          <TableColumn className="text-center">CUSTOMER</TableColumn>
          <TableColumn className="text-center">SHOP</TableColumn>
          <TableColumn className="text-center">ADMIN</TableColumn>
        </TableHeader>
        <TableBody>
          {AREAS.map((area, i) => (
            <TableRow key={area}>
              <TableCell className="font-medium">{area}</TableCell>
              <TableCell>
                <Mark allowed={MATRIX.customer[i]} />
              </TableCell>
              <TableCell>
                <Mark allowed={MATRIX.shop[i]} />
              </TableCell>
              <TableCell>
                <Mark allowed={MATRIX.admin[i]} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
