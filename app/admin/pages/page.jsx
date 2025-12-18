"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";
import { Button, Card, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Plus, Edit, Eye, Copy, Power, MoreVertical, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminOnly from "../components/AdminOnly";

export default function PagesManager() {
  const router = useRouter();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const snapshot = await getDocs(collection(db, "pages"));
      const pageList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPages(pageList);
    } catch (error) {
      console.error("Error loading pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const defaultPages = [
    { id: "home", name: "Home", type: "system", status: "published", lastModified: new Date().toISOString(), locked: true },
    { id: "shop", name: "Shop", type: "system", status: "published", lastModified: new Date().toISOString(), locked: false }
  ];

  const displayPages = pages.length > 0 ? pages : defaultPages;

  const getStatusColor = (status) => {
    switch (status) {
      case "published": return "success";
      case "draft": return "warning";
      case "scheduled": return "primary";
      default: return "default";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "system": return "danger";
      case "dynamic": return "primary";
      case "static": return "secondary";
      default: return "default";
    }
  };

  return (
    <AdminOnly>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Pages</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage all website pages</p>
          </div>
          <Button color="primary" startContent={<Plus className="w-4 h-4" />}>
            Create Page
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading pages...</div>
        ) : (
        <div className="grid gap-4">
          {displayPages.map((page) => (
            <Card key={page.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {page.locked && <Lock className="w-4 h-4 text-gray-400" />}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{page.name}</h3>
                      <Chip size="sm" color={getTypeColor(page.type)} variant="flat">{page.type}</Chip>
                      <Chip size="sm" color={getStatusColor(page.status)} variant="flat">{page.status}</Chip>
                    </div>
                    <p className="text-sm text-gray-500">Last modified: {new Date(page.lastModified).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="flat" startContent={<Edit className="w-4 h-4" />} onPress={() => router.push(`/admin/pages/editor/${page.id}`)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="flat" startContent={<Eye className="w-4 h-4" />} onPress={() => window.open(`/${page.id === 'home' ? '' : page.id}`, "_blank")}>
                    Preview
                  </Button>
                  {!page.locked && (
                    <Dropdown>
                      <DropdownTrigger>
                        <Button size="sm" variant="light" isIconOnly>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem startContent={<Copy className="w-4 h-4" />}>Duplicate</DropdownItem>
                        <DropdownItem startContent={<Power className="w-4 h-4" />}>Disable</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </AdminOnly>
  );
}
