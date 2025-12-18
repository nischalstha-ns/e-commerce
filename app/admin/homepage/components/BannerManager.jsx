"use client";

import { useState } from "react";
import { Card, CardBody, Button, Input, Textarea, Switch, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import toast from "react-hot-toast";

export default function BannerManager({ banners = [], onSave }) {
  const [localBanners, setLocalBanners] = useState(banners);
  const [editingBanner, setEditingBanner] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(localBanners);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    const updated = items.map((item, index) => ({ ...item, order: index }));
    setLocalBanners(updated);
    onSave(updated);
  };

  const handleAdd = () => {
    setEditingBanner({
      id: Date.now().toString(),
      title: "",
      subtitle: "",
      image: "",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      enabled: true,
      order: localBanners.length
    });
    onOpen();
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    onOpen();
  };

  const handleSave = () => {
    const exists = localBanners.find(b => b.id === editingBanner.id);
    const updated = exists
      ? localBanners.map(b => b.id === editingBanner.id ? editingBanner : b)
      : [...localBanners, editingBanner];
    
    setLocalBanners(updated);
    onSave(updated);
    toast.success("Banner saved!");
    onClose();
  };

  const handleDelete = (id) => {
    const updated = localBanners.filter(b => b.id !== id);
    setLocalBanners(updated);
    onSave(updated);
    toast.success("Banner deleted!");
  };

  const handleToggle = (id) => {
    const updated = localBanners.map(b => 
      b.id === id ? { ...b, enabled: !b.enabled } : b
    );
    setLocalBanners(updated);
    onSave(updated);
  };

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold">Hero Banners</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage homepage hero section banners</p>
          </div>
          <Button color="primary" startContent={<Plus size={16} />} onPress={handleAdd}>
            Add Banner
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="banners">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {localBanners.map((banner, index) => (
                  <Draggable key={banner.id} draggableId={banner.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="text-gray-400" size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{banner.title || "Untitled Banner"}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{banner.subtitle}</p>
                        </div>
                        <Switch
                          isSelected={banner.enabled}
                          onValueChange={() => handleToggle(banner.id)}
                          size="sm"
                        />
                        <Button size="sm" variant="flat" isIconOnly onPress={() => handleEdit(banner)}>
                          <Edit size={16} />
                        </Button>
                        <Button size="sm" variant="flat" color="danger" isIconOnly onPress={() => handleDelete(banner.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <ModalHeader>{editingBanner?.title ? "Edit Banner" : "Add Banner"}</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Title"
                  value={editingBanner?.title || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                />
                <Textarea
                  label="Subtitle"
                  value={editingBanner?.subtitle || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                />
                <Input
                  label="Image URL"
                  value={editingBanner?.image || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
                />
                <Input
                  label="Button Text"
                  value={editingBanner?.buttonText || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, buttonText: e.target.value })}
                />
                <Input
                  label="Button Link"
                  value={editingBanner?.buttonLink || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, buttonLink: e.target.value })}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Cancel</Button>
              <Button color="primary" onPress={handleSave}>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
}
