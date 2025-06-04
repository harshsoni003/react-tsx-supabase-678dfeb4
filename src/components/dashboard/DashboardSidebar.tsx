
import React from 'react';
import { Home, Phone, Users, BarChart3, Bell, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Dashboard', icon: Home, href: '#', active: true },
  { name: 'Calls', icon: Phone, href: '#', active: false },
  { name: 'Clients', icon: Users, href: '#', active: false },
  { name: 'Analytics', icon: BarChart3, href: '#', active: false },
  { name: 'Notifications', icon: Bell, href: '#', active: false },
  { name: 'Profile', icon: User, href: '#', active: false },
  { name: 'Settings', icon: Settings, href: '#', active: false },
];

const DashboardSidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 font-inter">Voice Agent</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              item.active
                ? 'bg-[#3B82F6] text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default DashboardSidebar;
