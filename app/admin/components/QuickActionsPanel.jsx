"use client";

import { Plus, Edit, Eye, Download, Upload, RefreshCw, Settings, Users, Package, ShoppingCart, BarChart3, Bell, Search, Filter } from 'lucide-react';
import { useState } from 'react';

const quickActions = [
  {
    category: 'Product Management',
    color: 'blue',
    actions: [
      { name: 'Add New Product', icon: Plus, href: '/admin/products?action=create', desc: 'Create a new product listing' },
      { name: 'Bulk Import', icon: Upload, href: '/admin/products?action=import', desc: 'Import products from CSV/Excel' },
      { name: 'Update Inventory', icon: RefreshCw, href: '/admin/products?action=inventory', desc: 'Bulk update stock levels' },
      { name: 'Export Catalog', icon: Download, href: '/admin/products?action=export', desc: 'Download product catalog' }
    ]
  },
  {
    category: 'Order Processing',
    color: 'green',
    actions: [
      { name: 'Process Orders', icon: ShoppingCart, href: '/admin/orders?status=pending', desc: 'Handle pending orders' },
      { name: 'Print Labels', icon: Download, href: '/admin/orders?action=labels', desc: 'Generate shipping labels' },
      { name: 'Update Tracking', icon: Edit, href: '/admin/orders?action=tracking', desc: 'Add tracking information' },
      { name: 'Refund Orders', icon: RefreshCw, href: '/admin/orders?action=refunds', desc: 'Process refund requests' }
    ]
  },
  {
    category: 'Customer Service',
    color: 'purple',
    actions: [
      { name: 'View Customers', icon: Users, href: '/admin/customers', desc: 'Manage customer accounts' },
      { name: 'Moderate Reviews', icon: Eye, href: '/admin/reviews?status=pending', desc: 'Review pending feedback' },
      { name: 'Send Notifications', icon: Bell, href: '/admin/customers?action=notify', desc: 'Broadcast messages' },
      { name: 'Customer Support', icon: Settings, href: '/admin/customers?action=support', desc: 'Handle support tickets' }
    ]
  }
];

const recentTasks = [
  { action: 'Product Added', item: 'iPhone 15 Pro Max', time: '2 minutes ago', status: 'completed' },
  { action: 'Order Processed', item: 'Order #12345', time: '5 minutes ago', status: 'completed' },
  { action: 'Review Approved', item: 'Samsung Galaxy S24', time: '10 minutes ago', status: 'completed' }
];

export default function QuickActionsPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredActions = quickActions.filter(category => {
    if (selectedCategory !== 'all' && category.category !== selectedCategory) return false;
    if (searchTerm) {
      return category.actions.some(action => 
        action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.desc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.4)] admin-card theme-transition">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-[#e5e7eb] theme-transition">Quick Actions</h3>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#2e2e2e] rounded-lg bg-white dark:bg-[#242424] text-gray-900 dark:text-[#e5e7eb] focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-transition"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-[#2e2e2e] rounded-lg bg-white dark:bg-[#242424] text-gray-900 dark:text-[#e5e7eb] focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-transition appearance-none"
            >
              <option value="all">All Categories</option>
              {quickActions.map(category => (
                <option key={category.category} value={category.category}>{category.category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {filteredActions.map((category) => (
            <div key={category.category}>
              <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-[#e5e7eb] theme-transition">
                {category.category}
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {category.actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={action.name}
                      href={action.href}
                      className="group p-4 bg-gray-50 dark:bg-[#242424] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-all duration-200 border border-gray-200 dark:border-[#2e2e2e] hover:shadow-md theme-transition"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h5 className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                          {action.name}
                        </h5>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.desc}
                      </p>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.4)] admin-card theme-transition">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-[#e5e7eb] theme-transition">Recent Administrative Tasks</h3>
        
        <div className="space-y-3">
          {recentTasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#242424] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">{task.action}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.item}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{task.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}