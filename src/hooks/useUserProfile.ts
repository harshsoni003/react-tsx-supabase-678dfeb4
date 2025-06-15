import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          
          // If the profile doesn't exist yet, create a default profile
          if (error.code === 'PGRST116' || error.message.includes('contains 0 rows')) {
            // Create a default profile for the user
            const defaultProfile = {
              id: user.id,
              username: user.email?.split('@')[0] || 'user',
              email: user.email || '',
              full_name: user.user_metadata?.full_name || null,
              role: 'user',
              avatar_url: user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              vip_access: false
            };
            
            // Insert the default profile
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert(defaultProfile)
              .select('*')
              .single();
              
            if (insertError) {
              console.error('Error creating default profile:', insertError);
              setError('Failed to create user profile');
            } else {
              console.log('Created default profile:', newProfile);
              setProfile(newProfile);
            }
          } else {
            setError(error.message);
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err);
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading, error };
};
