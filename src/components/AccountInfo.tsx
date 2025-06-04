
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

interface AccountInfoProps {
  user: User;
  profile: UserProfile | null;
}

const AccountInfo = ({ user, profile }: AccountInfoProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Username:</strong> {profile?.username || 'Not set'}</p>
        <p><strong>Role:</strong> {profile?.role || 'Loading...'}</p>
        <p><strong>VIP Access:</strong> {profile?.vip_access ? 'Yes' : 'No'}</p>
        <p><strong>Account created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        <p><strong>Email verified:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default AccountInfo;
