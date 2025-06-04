
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@supabase/supabase-js';
import { Shield, Crown } from 'lucide-react';
import AccountInfo from './AccountInfo';
import RoleAccessCards from './RoleAccessCards';

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

interface AuthenticatedViewProps {
  user: User;
  profile: UserProfile | null;
}

const AuthenticatedView = ({ user, profile }: AuthenticatedViewProps) => {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center space-x-2">
          <span>Welcome back!</span>
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
        </CardTitle>
        <CardDescription>
          You are successfully signed in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AccountInfo user={user} profile={profile} />
          
          {!user.email_confirmed_at && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Please verify your email:</strong> Check your inbox for a verification email to complete your account setup.
              </p>
            </div>
          )}

          <RoleAccessCards profile={profile} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthenticatedView;
