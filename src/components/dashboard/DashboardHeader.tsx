
import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserHeader from '@/components/UserHeader';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  vip_access: boolean;
}

interface DashboardHeaderProps {
  user: User;
  profile: UserProfile | null;
  onSignOut: () => void;
}

const DashboardHeader = ({ user, profile, onSignOut }: DashboardHeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 bg-[#F5F7FA] border-0 focus:ring-2 focus:ring-[#60A5FA]"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>
          
          <UserHeader user={user} profile={profile} onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
