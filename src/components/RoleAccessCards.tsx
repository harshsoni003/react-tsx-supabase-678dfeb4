
import { Shield, Crown } from 'lucide-react';

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

interface RoleAccessCardsProps {
  profile: UserProfile | null;
}

const RoleAccessCards = ({ profile }: RoleAccessCardsProps) => {
  return (
    <>
      {profile?.role === 'admin' && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-red-600" />
            <h4 className="font-semibold text-red-800">Administrator Access</h4>
          </div>
          <p className="text-red-700 text-sm">
            You have administrator privileges. You can access advanced features and manage the application.
          </p>
        </div>
      )}

      {profile?.vip_access && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Crown className="w-4 h-4 text-yellow-600" />
            <h4 className="font-semibold text-yellow-800">VIP Access</h4>
          </div>
          <p className="text-yellow-700 text-sm">
            You have VIP access! Enjoy exclusive features and premium benefits.
          </p>
        </div>
      )}
    </>
  );
};

export default RoleAccessCards;
