"use client";

import { useState } from 'react';
import { ShoppingCart, Users, FileText, BarChart3, Settings, Monitor, Activity, Zap, ChevronDown, ChevronRight } from 'lucide-react';

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
      { name: 'Review System', status: 'active', description: 'Product rating & reviews', health: 92 }
    ]
  },
  'Content Management': {
    icon: FileText,
    color: 'purple',
    features: [
      { name: 'Page Builder', status: 'active', description: 'Dynamic page creation', health: 88 },
      { name: 'Media Library', status: 'active', description: 'Cloudinary integration', health: 100 },
      { name: 'Homepage Editor', status: 'active', description: 'Customizable homepage', health: 95 },
      { name: 'Theme System', status: 'active', description: 'Dark/Light mode support', health: 100 }
    ]
  },
  'Analytics & Reporting': {
    icon: BarChart3,
    color: 'orange',
    features: [
      { name: 'Sales Analytics', status: 'active', description: 'Revenue tracking & insights', health: 90 },
      { name: 'Traffic Analytics', status: 'active', description: 'User behavior tracking', health: 85 },
      { name: 'Performance Monitoring', status: 'active', description: 'System health metrics', health: 95 },
      { name: 'Activity Logs', status: 'active', description: 'Audit trail system', health: 100 }
    ]
  },
  'System Administration': {
    icon: Settings,
    color: 'red',
    features: [
      { name: 'Role Management', status: 'active', description: 'User permission system', health: 100 },
      { name: 'System Settings', status: 'active', description: 'Global configuration', health: 100 },
      { name: 'Backup System', status: 'active', description: 'Automated data backup', health: 98 },
      { name: 'Security Monitoring', status: 'active', description: 'Threat detection', health: 95 }
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

  const getHealthColor = (health) => {
    if (health >= 95) return 'green';
    if (health >= 80) return 'yellow';
    if (health >= 60) return 'orange';
    return 'red';
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (status === 'development') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const getIntegrationBadgeClass = (status) => {
    if (status === 'connected') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  };

  const getHealthDotClass = (health) => {
    const color = getHealthColor(health);
    return `w-2 h-2 bg-${color}-500 rounded-full`;
  };

  const getStatusDotClass = (status) => {
    if (status === 'connected') return 'w-3 h-3 bg-green-500 rounded-full';
    if (status === 'configured') return 'w-3 h-3 bg-blue-500 rounded-full';
    return 'w-3 h-3 bg-gray-500 rounded-full';
  };

  return (
    <div className="space-y-6">
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
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 dark:text-[#e5e7eb]">{category}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{data.features.length} features</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={getHealthDotClass(avgHealth)}></div>
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
                            <span className={getStatusBadgeClass(feature.status)}>
                              {feature.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <div className={getHealthDotClass(feature.health)}></div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">{feature.health}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.4)] admin-card theme-transition">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-[#e5e7eb] theme-transition flex items-center gap-2">
          <Zap className="w-6 h-6" />
          External Integrations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <div key={integration.name} className="p-4 bg-gray-50 dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-[#2e2e2e]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-[#e5e7eb]">{integration.name}</h4>
                <div className={getStatusDotClass(integration.status)}></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{integration.type}</p>
              <div className="flex items-center justify-between">
                <span className={getIntegrationBadgeClass(integration.status)}>
                  {integration.status}
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{integration.health}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
