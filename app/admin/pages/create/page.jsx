"use client";

import { useState } from "react";
import { Button, Input, Select, SelectItem, Card } from "@heroui/react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";
import { useAuth } from "@/contexts/AuthContext";
import AdminOnly from "../../components/AdminOnly";
import toast from "react-hot-toast";

export default function CreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ id: "", name: "", type: "static" });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!formData.id || !formData.name) {
      toast.error("Page ID and name are required");
      return;
    }

    setCreating(true);
    try {
      const pageId = formData.id.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, "pages", pageId), {
        id: pageId,
        name: formData.name,
        type: formData.type,
        sections: [],
        status: "draft",
        seo: { title: formData.name, description: "", keywords: "" },
        createdAt: new Date().toISOString(),
        createdBy: user?.uid
      });

      toast.success("Page created!");
      router.push(`/admin/pages/editor/${pageId}`);
    } catch (error) {
      toast.error("Failed to create page");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminOnly>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Page</h1>
        <Card className="p-6">
          <div className="space-y-4">
            <Input label="Page ID" placeholder="about-us" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} />
            <Input label="Page Name" placeholder="About Us" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Select label="Page Type" selectedKeys={[formData.type]} onSelectionChange={(keys) => setFormData({ ...formData, type: Array.from(keys)[0] })}>
              <SelectItem key="static">Static Page</SelectItem>
              <SelectItem key="dynamic">Dynamic Page</SelectItem>
            </Select>
            <div className="flex gap-3 pt-4">
              <Button variant="light" onPress={() => router.back()}>Cancel</Button>
              <Button color="primary" onPress={handleCreate} isLoading={creating}>Create Page</Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminOnly>
  );
}
