
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon, Shield, Crown } from 'lucide-react';

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

interface UserHeaderProps {
  user: User | null;
  profile: UserProfile | null;
  onSignOut: () => void;
}

const UserHeader = ({ user, profile, onSignOut }: UserHeaderProps) => {
  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <UserIcon className="w-5 h-5 text-gray-600" />
        <span className="text-gray-700">
          {profile?.username || user.email}
        </span>
        {profile?.role === 'admin' && (
          <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        )}
        {profile?.vip_access && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Crown className="w-3 h-3 mr-1" />
            VIP
          </Badge>
        )}
      </div>
      <Button onClick={onSignOut} variant="outline" size="sm">
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default UserHeader;
