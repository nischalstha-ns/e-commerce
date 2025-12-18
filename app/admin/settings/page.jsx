"use client";

import { useState, useEffect } from "react";
import { Button, Card, Input, Switch, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tabs, Tab } from "@heroui/react";
import { Plus, GripVertical, Edit, Trash2, Save, Store, Mail, Phone, MapPin, CreditCard, Truck, Menu as MenuIcon } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAuth } from "@/contexts/AuthContext";
import { useShopProfile } from "@/lib/firestore/shop/read";
import { updateShopProfile } from "@/lib/firestore/shop/write";
import { useNavigation } from "@/lib/firestore/navigation/read";
import { updateNavigation } from "@/lib/firestore/navigation/write";
import { useTranslation } from "@/lib/hooks/useTranslation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import toast from "react-hot-toast";
import AdminOnly from "../components/AdminOnly";

export default function SettingsPage() {
  const t = useTranslation();
  const { user } = useAuth();
  const { data: shopProfile, isLoading } = useShopProfile(user?.uid);
  const { data: navData, isLoading: navLoading } = useNavigation();
  const [formData, setFormData] = useState({
    shopName: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    paymentDetails: "",
    deliveryFee: 0,
    freeDeliveryThreshold: 0
  });
  const [logo, setLogo] = useState(navData.logo);
  const [menuItems, setMenuItems] = useState(navData.menuItems);
  const [editingItem, setEditingItem] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSaving, setSaving] = useState(false);

  useEffect(() => {
    if (shopProfile) {
      setFormData({
        shopName: shopProfile.shopName || "",
        description: shopProfile.description || "",
        email: shopProfile.email || "",
        phone: shopProfile.phone || "",
        address: shopProfile.address || "",
        paymentDetails: shopProfile.paymentDetails || "",
        deliveryFee: shopProfile.deliveryFee || 0,
        freeDeliveryThreshold: shopProfile.freeDeliveryThreshold || 0
      });
    }
  }, [shopProfile]);

  useEffect(() => {
    setLogo(navData.logo);
    setMenuItems(navData.menuItems);
  }, [navData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateShopProfile({ userId: user.uid, data: formData });
      toast.success(t.settingsSaved);
    } catch (error) {
      toast.error(t.failedToSave);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNav = async () => {
    try {
      await updateNavigation({ logo, menuItems });
      toast.success("Navigation updated successfully");
    } catch (error) {
      toast.error("Failed to update navigation");
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(menuItems);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    const updated = items.map((item, index) => ({ ...item, order: index + 1 }));
    setMenuItems(updated);
  };

  const handleAddItem = () => {
    setEditingItem({ id: Date.now().toString(), label: "", link: "", enabled: true, order: menuItems.length + 1 });
    onOpen();
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    onOpen();
  };

  const handleSaveItem = () => {
    if (menuItems.find(i => i.id === editingItem.id)) {
      setMenuItems(menuItems.map(i => i.id === editingItem.id ? editingItem : i));
    } else {
      setMenuItems([...menuItems, editingItem]);
    }
    onClose();
  };

  const handleDeleteItem = (id) => {
    setMenuItems(menuItems.filter(i => i.id !== id));
  };

  const handleToggleItem = (id) => {
    setMenuItems(menuItems.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
  };

  if (isLoading || navLoading) return <LoadingSpinner size="lg" label={t.loading} />;

  return (
    <AdminOnly>
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage shop profile, navigation and system settings</p>
      </div>

      <Tabs aria-label="Settings tabs">
        <Tab key="navigation" title={<div className="flex items-center gap-2"><MenuIcon className="w-4 h-4" />Navigation</div>}>
          <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Navigation Manager</h3>
                <p className="text-gray-600 dark:text-gray-400">Manage website navigation bar</p>
              </div>
              <Button color="primary" startContent={<Save className="w-4 h-4" />} onPress={handleSaveNav}>
                Save Navigation
              </Button>
            </div>

            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">Logo Settings</h4>
              <div className="space-y-4">
                <Input
                  label="Logo URL"
                  value={logo.url}
                  onChange={(e) => setLogo({ ...logo, url: e.target.value })}
                />
                <Input
                  label="Alt Text"
                  value={logo.alt}
                  onChange={(e) => setLogo({ ...logo, alt: e.target.value })}
                />
                <Input
                  label="Link"
                  value={logo.link}
                  onChange={(e) => setLogo({ ...logo, link: e.target.value })}
                />
                {logo.url && (
                  <div className="flex items-center gap-2">
                    <img src={logo.url} alt={logo.alt} className="h-12 object-contain" />
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Menu Items</h4>
                <Button size="sm" color="primary" startContent={<Plus className="w-4 h-4" />} onPress={handleAddItem}>
                  Add Item
                </Button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="menu-items">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {menuItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-gray-500">{item.link}</p>
                              </div>
                              <Switch size="sm" isSelected={item.enabled} onValueChange={() => handleToggleItem(item.id)} />
                              <Button size="sm" variant="flat" isIconOnly onPress={() => handleEditItem(item)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="flat" color="danger" isIconOnly onPress={() => handleDeleteItem(item.id)}>
                                <Trash2 className="w-4 h-4" />
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
            </Card>
          </div>
        </Tab>

        <Tab key="shop" title={<div className="flex items-center gap-2"><Store className="w-4 h-4" />Shop Profile</div>}>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Store className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t.shopProfile}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t.shopName}</label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t.shopDescription}</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t.contactEmail}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t.contactPhone}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t.address}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t.paymentDetails}</h3>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Bank Account / Payment Info</label>
            <textarea
              rows={3}
              value={formData.paymentDetails}
              onChange={(e) => setFormData({ ...formData, paymentDetails: e.target.value })}
              placeholder="Enter bank account details or payment information"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t.deliverySettings}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Delivery Fee (Rs.)</label>
              <input
                type="number"
                step="0.01"
                value={formData.deliveryFee || ''}
                onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Free Delivery Threshold (Rs.)</label>
              <input
                type="number"
                step="0.01"
                value={formData.freeDeliveryThreshold || ''}
                onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-400 transition-colors"
          >
            <Save className="w-5 h-5" />
            {isSaving ? t.saving : t.save}
          </button>
        </div>
      </form>
        </Tab>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>{editingItem?.label ? "Edit Menu Item" : "Add Menu Item"}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Label"
                value={editingItem?.label || ""}
                onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
              />
              <Input
                label="Link"
                value={editingItem?.link || ""}
                onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
              />
              <Switch
                isSelected={editingItem?.enabled}
                onValueChange={(val) => setEditingItem({ ...editingItem, enabled: val })}
              >
                Enabled
              </Switch>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancel</Button>
            <Button color="primary" onPress={handleSaveItem}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
    </AdminOnly>
  );
}
