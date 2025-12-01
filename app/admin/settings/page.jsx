"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useShopProfile } from "@/lib/firestore/shop/read";
import { updateShopProfile } from "@/lib/firestore/shop/write";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Store, Mail, Phone, MapPin, CreditCard, Truck, Save, Database, Cloud, Key, Eye, EyeOff, Settings } from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const t = useTranslation();
  const { user } = useAuth();
  const { data: shopProfile, isLoading } = useShopProfile(user?.uid);
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
  const [apiKeys, setApiKeys] = useState({
    firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    cloudinaryUploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
    cloudinaryApiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || ""
  });
  const [showKeys, setShowKeys] = useState({});
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

  if (isLoading) return <LoadingSpinner size="lg" label={t.loading} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.shopSettings}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your shop profile and settings</p>
      </div>

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
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Free Delivery Threshold (Rs.)</label>
              <input
                type="number"
                step="0.01"
                value={formData.freeDeliveryThreshold}
                onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {user && (user.email === "admin@nischalfancystore.com" || user.email === "nischallamichhane10@gmail.com") && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-2 border-red-500">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Firebase Database Control</h3>
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">ADMIN ONLY</span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a href={`https://console.firebase.google.com/project/${apiKeys.firebaseProjectId}/firestore`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <Database className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Firestore Database</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manage collections & documents</p>
                    </div>
                  </a>
                  <a href={`https://console.firebase.google.com/project/${apiKeys.firebaseProjectId}/authentication/users`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <Key className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Authentication</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manage users & auth</p>
                    </div>
                  </a>
                  <a href={`https://console.firebase.google.com/project/${apiKeys.firebaseProjectId}/storage`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <Cloud className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Storage</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manage file storage</p>
                    </div>
                  </a>
                  <a href={`https://console.firebase.google.com/project/${apiKeys.firebaseProjectId}/settings/general`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <Settings className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Project Settings</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Configure Firebase project</p>
                    </div>
                  </a>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Current Configuration:</p>
                  {[{key: 'firebaseApiKey', label: 'API Key'}, {key: 'firebaseAuthDomain', label: 'Auth Domain'}, {key: 'firebaseProjectId', label: 'Project ID'}].map(({key, label}) => (
                    <div key={key} className="mb-2">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                      <div className="relative">
                        <input type={showKeys[key] ? "text" : "password"} value={apiKeys[key]} readOnly className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" />
                        <button type="button" onClick={() => setShowKeys({...showKeys, [key]: !showKeys[key]})} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showKeys[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-2 border-orange-500">
              <div className="flex items-center gap-3 mb-6">
                <Cloud className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Cloudinary Media Control</h3>
                <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded">ADMIN ONLY</span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a href={`https://console.cloudinary.com/console/${apiKeys.cloudinaryCloudName}/media_library/folders/home`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                    <Cloud className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Media Library</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Browse & manage images</p>
                    </div>
                  </a>
                  <a href={`https://console.cloudinary.com/console/${apiKeys.cloudinaryCloudName}/settings/upload`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                    <Key className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Upload Settings</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Configure upload presets</p>
                    </div>
                  </a>
                  <a href={`https://console.cloudinary.com/console/${apiKeys.cloudinaryCloudName}/settings/security`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                    <Database className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Security</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">API keys & access control</p>
                    </div>
                  </a>
                  <a href={`https://console.cloudinary.com/console/${apiKeys.cloudinaryCloudName}/settings/account`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                    <Settings className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Account Settings</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manage Cloudinary account</p>
                    </div>
                  </a>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Current Configuration:</p>
                  {[{key: 'cloudinaryCloudName', label: 'Cloud Name'}, {key: 'cloudinaryUploadPreset', label: 'Upload Preset'}, {key: 'cloudinaryApiKey', label: 'API Key'}].map(({key, label}) => (
                    <div key={key} className="mb-2">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                      <div className="relative">
                        <input type={showKeys[key] ? "text" : "password"} value={apiKeys[key]} readOnly className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" />
                        <button type="button" onClick={() => setShowKeys({...showKeys, [key]: !showKeys[key]})} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showKeys[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

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
    </div>
  );
}
