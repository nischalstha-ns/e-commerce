"use client";

import { Card, CardBody } from "@heroui/react";

export default function NavbarControl({ settings, onSave }) {
  return (
    <Card>
      <CardBody className="p-6">
        <h3 className="text-xl font-semibold mb-4">Navbar Settings</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Navbar is managed in Settings → Navigation
        </p>
      </CardBody>
    </Card>
  );
}
