
import React from 'react';
import { Home, Phone, Users, BarChart3, Bell, User, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Dashboard', icon: Home, href: '/dashboard', active: false },

  { name: 'Calls', icon: Phone, href: '/calls', active: false },
  { name: 'Clients', icon: Users, href: '/clients', active: false },
  { name: 'Analytics', icon: BarChart3, href: '/analytics', active: false },
  { name: 'Notifications', icon: Bell, href: '/notifications', active: false },
  { name: 'Profile', icon: User, href: '/profile', active: false },
  { name: 'Settings', icon: Settings, href: '/settings', active: false },
];

const DashboardSidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="block">
          <h1 className="text-xl font-semibold text-gray-900 font-inter hover:text-blue-600 transition-colors cursor-pointer">Voice Bolt</h1>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-[#3B82F6] text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardSidebar;
