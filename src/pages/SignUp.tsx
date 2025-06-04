
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SignUpForm from '@/components/auth/SignUpForm';
import SignUpSuccessScreen from '@/components/auth/SignUpSuccessScreen';
import VerifiedUserWarning from '@/components/auth/VerifiedUserWarning';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showVerifiedUserWarning, setShowVerifiedUserWarning] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setShowVerifiedUserWarning(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Please choose a stronger password.');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting signup for email:', email);
      
      // First, check if user already exists by trying to sign in
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password' // This will fail for security, but we can check the error
      });

      // If we get here without error, something unexpected happened
      console.log('Unexpected successful signin during signup check');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: username,
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.log('Signup error:', error.message);
        
        // Check for various "user already exists" error messages
        if (error.message.includes('already registered') || 
            error.message.includes('User already registered') ||
            error.message.includes('already exists') ||
            error.message.includes('user_repeated_signup')) {
          console.log('Setting verified user warning to true');
          setShowVerifiedUserWarning(true);
          setError('');
        } else {
          setError(error.message);
        }
      } else if (data.user) {
        // Check if this is a repeated signup by looking at the user creation timestamp
        // If the user was created more than a few seconds ago, it's likely an existing user
        const userCreatedAt = new Date(data.user.created_at || '');
        const now = new Date();
        const timeDifference = now.getTime() - userCreatedAt.getTime();
        
        console.log('User created at:', userCreatedAt);
        console.log('Current time:', now);
        console.log('Time difference (ms):', timeDifference);
        
        // If user was created more than 10 seconds ago, it's likely an existing user
        if (timeDifference > 10000) {
          console.log('User appears to be existing (created more than 10s ago), showing warning');
          setShowVerifiedUserWarning(true);
          setError('');
        } else if (!data.session) {
          // New user created, needs email verification
          console.log('New user created, showing success message');
          setSuccess(true);
          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account.",
          });
        } else if (data.user.email_confirmed_at) {
          // User already exists and is verified
          console.log('User already exists and is verified');
          setShowVerifiedUserWarning(true);
          setError('');
        } else {
          // User exists but email not confirmed yet
          console.log('User exists but email not confirmed');
          setSuccess(true);
          toast({
            title: "Please verify your email",
            description: "Check your email for the verification link.",
          });
        }
      }
    } catch (err) {
      // Try to determine if this is a user already exists situation
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.log('Caught error during signup:', errorMessage);
      
      if (errorMessage.includes('Invalid login credentials') || 
          errorMessage.includes('already registered') ||
          errorMessage.includes('already exists')) {
        // This indicates the user likely already exists
        setShowVerifiedUserWarning(true);
        setError('');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (success) {
    return <SignUpSuccessScreen email={email} />;
  }

  if (showVerifiedUserWarning) {
    return <VerifiedUserWarning />;
  }

  return (
    <SignUpForm
      username={username}
      setUsername={setUsername}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      loading={loading}
      error={error}
      onSubmit={handleSignUp}
      onGoogleSignUp={handleGoogleSignUp}
    />
  );
};

export default SignUp;
