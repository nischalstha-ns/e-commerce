"use client";

import { useState } from 'react';
import { Package, ShoppingCart, Users, Star, Tag, Layers, Folder, BarChart3, Settings, FileText, Image as ImageIcon, History, Monitor, UserCheck, Palette, Home, CreditCard, MapPin, ChevronDown, ChevronRight, Activity, Database, Shield, Zap } from 'lucide-react';

const systemFeatures = {
  'E-commerce Core': {
    icon: ShoppingCart,
    color: 'blue',
    features: [
      { name: 'Product Management', status: 'active', description: 'Full CRUD operations for products', health: 100 },
      { name: 'Order Processing', status: 'active', description: 'Order lifecycle management', health: 98 },
      { name: 'Inventory Tracking', status: 'active', description: 'Real-time stock management', health: 95 },
      { name: 'Shopping Cart', status: 'active', description: 'Persistent cart functionality', health: 100 },
      { name: 'Checkout System', status: 'active', description: 'Secure payment processing', health: 97 }
    ]
  },
  'Customer Management': {
    icon: Users,
    color: 'green',
    features: [
      { name: 'User Authentication', status: 'active', description: 'Firebase Auth integration', health: 99 },
      { name: 'Customer Profiles', status: 'active', description: 'Comprehensive user data', health: 100 },
      { name: 'Order History', status: 'active', description: 'Customer purchase tracking', health: 100 },
      { name: 'Review System', status: 'active', description: 'Product rating & reviews', health: 92 },
      { name: 'Wishlist', status: 'development', description: 'Save for later functionality', health: 60 }
    ]
  },
  'Content Management': {
    icon: FileText,
    color: 'purple',
    features: [
      { name: 'Page Builder', status: 'active', description: 'Dynamic page creation', health: 88 },
      { name: 'Media Library', status: 'active', description: 'Cloudinary integration', health: 100 },
      { name: 'Homepage Editor', status: 'active', description: 'Customizable homepage', health: 95 },
      { name: 'Theme System', status: 'active', description: 'Dark/Light mode support', health: 100 },
      { name: 'SEO Tools', status: 'active', description: 'Meta tags & optimization', health: 85 }
    ]
  },
  'Analytics & Reporting': {
    icon: BarChart3,
    color: 'orange',
    features: [
      { name: 'Sales Analytics', status: 'active', description: 'Revenue tracking & insights', health: 90 },
      { name: 'Traffic Analytics', status: 'active', description: 'User behavior tracking', health: 85 },
      { name: 'Performance Monitoring', status: 'active', description: 'System health metrics', health: 95 },
      { name: 'Activity Logs', status: 'active', description: 'Audit trail system', health: 100 },
      { name: 'Custom Reports', status: 'development', description: 'Configurable reporting', health: 40 }
    ]
  },
  'System Administration': {
    icon: Settings,
    color: 'red',
    features: [
      { name: 'Role Management', status: 'active', description: 'User permission system', health: 100 },
      { name: 'System Settings', status: 'active', description: 'Global configuration', health: 100 },
      { name: 'Backup System', status: 'active', description: 'Automated data backup', health: 98 },
      { name: 'Security Monitoring', status: 'active', description: 'Threat detection', health: 95 },
      { name: 'API Management', status: 'active', description: 'External integrations', health: 90 }
    ]
  },
  'Multi-vendor Support': {
    icon: Monitor,
    color: 'indigo',
    features: [
      { name: 'Vendor Dashboard', status: 'active', description: 'Shop-specific interface', health: 85 },
      { name: 'Commission System', status: 'development', description: 'Revenue sharing', health: 30 },
      { name: 'Vendor Analytics', status: 'development', description: 'Shop performance metrics', health: 45 },
      { name: 'Product Approval', status: 'active', description: 'Admin moderation', health: 80 },
      { name: 'Payout Management', status: 'planning', description: 'Automated payments', health: 10 }
    ]
  }
};

const integrations = [
  { name: 'Firebase', type: 'Database & Auth', status: 'connected', health: 99 },
  { name: 'Cloudinary', type: 'Media Storage', status: 'connected', health: 100 },
  { name: 'Stripe', type: 'Payment Processing', status: 'connected', health: 97 },
  { name: 'Vercel', type: 'Hosting & CDN', status: 'connected', health: 100 },
  { name: 'SendGrid', type: 'Email Service', status: 'connected', health: 95 },
  { name: 'Google Analytics', type: 'Web Analytics', status: 'configured', health: 90 }
];

export default function SystemOverview() {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'development': return 'yellow';
      case 'planning': return 'gray';
      case 'connected': return 'green';
      case 'configured': return 'blue';
      default: return 'gray';
    }
  };

  const getHealthColor = (health) => {
    if (health >= 95) return 'green';
    if (health >= 80) return 'yellow';
    if (health >= 60) return 'orange';
    return 'red';
  };

  return (
    <div className="space-y-6">
      {/* System Features Overview */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.4)] admin-card theme-transition">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-[#e5e7eb] theme-transition flex items-center gap-2">
          <Activity className="w-6 h-6" />
          System Features & Health
        </h3>
        
        <div className="space-y-4">
          {Object.entries(systemFeatures).map(([category, data]) => {
            const Icon = data.icon;
            const isExpanded = expandedSections[category];
            const avgHealth = Math.round(data.features.reduce((sum, f) => sum + f.health, 0) / data.features.length);
            
            return (
              <div key={category} className="border border-gray-200 dark:border-[#2e2e2e] rounded-lg theme-transition">
                <button
                  onClick={() => toggleSection(category)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${data.color}-100 dark:bg-${data.color}-900/30 rounded-lg`}>
                      <Icon className={`w-5 h-5 text-${data.color}-600 dark:text-${data.color}-400`} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 dark:text-[#e5e7eb]">{category}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{data.features.length} features</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 bg-${getHealthColor(avgHealth)}-500 rounded-full`}></div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{avgHealth}%</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-200 dark:border-[#2e2e2e] pt-4">
                    {data.features.map((feature) => (
                      <div key={feature.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#242424] rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-gray-900 dark:text-[#e5e7eb]">{feature.name}</h5>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${\n                              feature.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :\n                              feature.status === 'development' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :\n                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'\n                            }`}>\n                              {feature.status}\n                            </span>\n                          </div>\n                          <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>\n                        </div>\n                        \n                        <div className="flex items-center gap-2 ml-4">
                          <div className={`w-2 h-2 bg-${getHealthColor(feature.health)}-500 rounded-full`}></div>\n                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[3rem] text-right\">{feature.health}%</span>\n                        </div>\n                      </div>\n                    ))}\n                  </div>\n                )}\n              </div>\n            );\n          })}\n        </div>\n      </div>\n\n      {/* Integrations Status */}\n      <div className=\"bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.4)] admin-card theme-transition\">\n        <h3 className=\"text-xl font-semibold mb-6 text-gray-900 dark:text-[#e5e7eb] theme-transition flex items-center gap-2\">\n          <Zap className=\"w-6 h-6\" />\n          External Integrations\n        </h3>\n        \n        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">\n          {integrations.map((integration) => (\n            <div key={integration.name} className=\"p-4 bg-gray-50 dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-[#2e2e2e]\">\n              <div className=\"flex items-center justify-between mb-2\">\n                <h4 className=\"font-semibold text-gray-900 dark:text-[#e5e7eb]\">{integration.name}</h4>\n                <div className={`w-3 h-3 bg-${getStatusColor(integration.status)}-500 rounded-full`}></div>\n              </div>\n              <p className=\"text-sm text-gray-600 dark:text-gray-400 mb-2\">{integration.type}</p>\n              <div className=\"flex items-center justify-between\">\n                <span className={`px-2 py-1 text-xs font-medium rounded-full ${\n                  integration.status === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :\n                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'\n                }`}>\n                  {integration.status}\n                </span>\n                <span className=\"text-sm font-medium text-gray-600 dark:text-gray-400\">{integration.health}%</span>\n              </div>\n            </div>\n          ))}\n        </div>\n      </div>\n    </div>\n  );\n}\n