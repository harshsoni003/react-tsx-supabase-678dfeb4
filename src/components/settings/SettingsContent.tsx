import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Phone, User, Volume2, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SettingsContent = () => {
  const [activeTab, setActiveTab] = useState('integrations');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const [callSettings, setCallSettings] = useState({
    recordCalls: true,
    transcribeCalls: true,
    autoAnswer: false,
    voiceId: 'default'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    callNotifications: true,
    messageNotifications: true,
    language: 'en'
  });

  const [profileSettings, setProfileSettings] = useState({
    displayName: 'John Smith',
    timezone: 'UTC-8',
    language: 'en'
  });

  // Load API key from user metadata
  useEffect(() => {
    const loadApiKey = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const apiKey = session.user.user_metadata?.elevenlabs_api_key;
        if (apiKey) {
          setElevenLabsApiKey(apiKey);
        }
      }
    };
    
    loadApiKey();
  }, []);

  // Save ElevenLabs API key
  const handleSaveApiKey = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          elevenlabs_api_key: elevenLabsApiKey
        }
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess('ElevenLabs API key saved successfully');
      toast({
        title: "API key saved",
        description: "Your ElevenLabs API key has been saved successfully.",
      });
    } catch (err) {
      console.error('Error saving API key:', err);
      setError('Failed to save API key. Please try again.');
      toast({
        title: "Error saving API key",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Test ElevenLabs API key
  const handleTestApiKey = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        method: 'GET',
        headers: {
          'xi-api-key': elevenLabsApiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API test failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setSuccess(`API key valid! Account: ${data.subscription?.tier || 'Free'}`);
      toast({
        title: "API key is valid",
        description: `Connected to ElevenLabs account: ${data.subscription?.tier || 'Free'}`,
      });
    } catch (err) {
      console.error('Error testing API key:', err);
      setError('Invalid API key or connection error');
      toast({
        title: "API key test failed",
        description: err instanceof Error ? err.message : 'Failed to validate API key',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-inter">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure your application preferences
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="calls">Call Settings</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account information and email preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Account settings fields would go here */}
              <p className="text-sm text-gray-500">Account settings coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive email notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive push notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Call Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications for calls</p>
                </div>
                <Switch
                  checked={notificationSettings.callNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, callNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Message Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications for messages</p>
                </div>
                <Switch
                  checked={notificationSettings.messageNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, messageNotifications: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ElevenLabs Integration</CardTitle>
              <CardDescription>
                Connect your ElevenLabs account to access voice calls and history.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="elevenlabs-api-key">ElevenLabs API Key</Label>
                <div className="relative">
                  <Input
                    id="elevenlabs-api-key"
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="Enter your ElevenLabs API key"
                    value={elevenLabsApiKey}
                    onChange={(e) => setElevenLabsApiKey(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  You can find your API key in your{' '}
                  <a 
                    href="https://elevenlabs.io/app/account" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    ElevenLabs account settings
                  </a>
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSaveApiKey} 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save API Key'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestApiKey}
                  disabled={loading || !elevenLabsApiKey}
                >
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Settings</CardTitle>
              <CardDescription>
                Configure how calls are handled and recorded.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Record Calls</p>
                  <p className="text-sm text-gray-500">Automatically record all calls</p>
                </div>
                <Switch
                  checked={callSettings.recordCalls}
                  onCheckedChange={(checked) => setCallSettings({...callSettings, recordCalls: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Transcribe Calls</p>
                  <p className="text-sm text-gray-500">Automatically transcribe all calls</p>
                </div>
                <Switch
                  checked={callSettings.transcribeCalls}
                  onCheckedChange={(checked) => setCallSettings({...callSettings, transcribeCalls: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Answer</p>
                  <p className="text-sm text-gray-500">Automatically answer incoming calls</p>
                </div>
                <Switch
                  checked={callSettings.autoAnswer}
                  onCheckedChange={(checked) => setCallSettings({...callSettings, autoAnswer: checked})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voice-id">Default Voice</Label>
                <Select
                  value={callSettings.voiceId}
                  onValueChange={(value) => setCallSettings({...callSettings, voiceId: value})}
                >
                  <SelectTrigger id="voice-id">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Voice</SelectItem>
                    <SelectItem value="rachel">Rachel</SelectItem>
                    <SelectItem value="dave">Dave</SelectItem>
                    <SelectItem value="sarah">Sarah</SelectItem>
                    <SelectItem value="josh">Josh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-500">Switch between light and dark mode</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={notificationSettings.language}
                  onValueChange={(value) => setNotificationSettings({...notificationSettings, language: value})}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Manage your profile and display preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={profileSettings.displayName}
                onChange={(e) => setProfileSettings({...profileSettings, displayName: e.target.value})}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={profileSettings.timezone} onValueChange={(value) => setProfileSettings({...profileSettings, timezone: value})}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                  <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="UTC+0">UTC (UTC+0)</SelectItem>
                  <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={profileSettings.language} onValueChange={(value) => setProfileSettings({...profileSettings, language: value})}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Audio Settings
            </CardTitle>
            <CardDescription>
              Configure your microphone and speaker settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="microphone">Microphone</Label>
                <Select>
                  <SelectTrigger className="rounded-lg mt-2">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Microphone</SelectItem>
                    <SelectItem value="usb">USB Microphone</SelectItem>
                    <SelectItem value="bluetooth">Bluetooth Headset</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="speaker">Speaker</Label>
                <Select>
                  <SelectTrigger className="rounded-lg mt-2">
                    <SelectValue placeholder="Select speaker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Speaker</SelectItem>
                    <SelectItem value="headphones">Headphones</SelectItem>
                    <SelectItem value="bluetooth">Bluetooth Speaker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-[#3B82F6] hover:bg-[#2563EB]">
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsContent;
