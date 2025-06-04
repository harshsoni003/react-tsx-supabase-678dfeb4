
import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Phone, User, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SettingsContent = () => {
  const [callSettings, setCallSettings] = useState({
    recordCalls: true,
    enableTranscription: true,
    autoAnswer: false,
    callQuality: 'high'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    callAlerts: true,
    systemUpdates: false
  });

  const [profileSettings, setProfileSettings] = useState({
    displayName: 'John Smith',
    timezone: 'UTC-8',
    language: 'en'
  });

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

        {/* Call Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Call Preferences
            </CardTitle>
            <CardDescription>
              Configure your call recording and transcription settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Record Calls</Label>
                <p className="text-sm text-gray-600">Automatically record all incoming and outgoing calls</p>
              </div>
              <Switch
                checked={callSettings.recordCalls}
                onCheckedChange={(checked) => setCallSettings({...callSettings, recordCalls: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Transcription</Label>
                <p className="text-sm text-gray-600">Convert call audio to text in real-time</p>
              </div>
              <Switch
                checked={callSettings.enableTranscription}
                onCheckedChange={(checked) => setCallSettings({...callSettings, enableTranscription: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Answer</Label>
                <p className="text-sm text-gray-600">Automatically answer incoming calls</p>
              </div>
              <Switch
                checked={callSettings.autoAnswer}
                onCheckedChange={(checked) => setCallSettings({...callSettings, autoAnswer: checked})}
              />
            </div>
            <div>
              <Label htmlFor="callQuality">Call Quality</Label>
              <Select value={callSettings.callQuality} onValueChange={(value) => setCallSettings({...callSettings, callQuality: value})}>
                <SelectTrigger className="rounded-lg mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Data Saving)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="high">High (Best Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-600">Receive browser notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Call Alerts</Label>
                    <p className="text-sm text-gray-600">Get notified about incoming calls</p>
                  </div>
                  <Switch
                    checked={notificationSettings.callAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, callAlerts: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-gray-600">Notifications about system maintenance</p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemUpdates: checked})}
                  />
                </div>
              </div>
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
