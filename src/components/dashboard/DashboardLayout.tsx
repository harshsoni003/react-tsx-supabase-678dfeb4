
import React from 'react';
import { User } from '@supabase/supabase-js';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

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

interface DashboardLayoutProps {
  user: User;
  profile: UserProfile | null;
  onSignOut: () => void;
  children: React.ReactNode;
}

const DashboardLayout = ({ user, profile, onSignOut, children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={user} profile={profile} onSignOut={onSignOut} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
