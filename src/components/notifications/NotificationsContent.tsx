
import React from 'react';
import { Bell, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockNotifications = [
  {
    id: 1,
    type: 'call',
    icon: Bell,
    title: 'New call received',
    description: 'Incoming call from John Smith',
    timestamp: '2 minutes ago',
    read: false,
    color: 'text-blue-500'
  },
  {
    id: 2,
    type: 'alert',
    icon: AlertCircle,
    title: 'System maintenance',
    description: 'Scheduled maintenance tonight at 2:00 AM',
    timestamp: '1 hour ago',
    read: false,
    color: 'text-yellow-500'
  },
  {
    id: 3,
    type: 'success',
    icon: CheckCircle,
    title: 'Call completed',
    description: 'Call with Emily Davis completed successfully',
    timestamp: '3 hours ago',
    read: true,
    color: 'text-green-500'
  },
  {
    id: 4,
    type: 'info',
    icon: Info,
    title: 'New feature available',
    description: 'Live transcription is now available for all calls',
    timestamp: '1 day ago',
    read: true,
    color: 'text-blue-500'
  },
  {
    id: 5,
    type: 'call',
    icon: Bell,
    title: 'Missed call',
    description: 'Missed call from Sarah Johnson',
    timestamp: '2 days ago',
    read: true,
    color: 'text-red-500'
  }
];

const NotificationsContent = () => {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-inter">Notifications</h1>
          <p className="text-sm text-gray-600 mt-1">
            Stay updated with your latest activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-[#3B82F6] text-white">
              {unreadCount} unread
            </Badge>
          )}
          <Button variant="outline" size="sm">
            Mark all as read
          </Button>
          <Button variant="outline" size="sm">
            Clear all
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="divide-y divide-gray-100">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <notification.icon className={`h-5 w-5 ${notification.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[#3B82F6] rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {notification.timestamp}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <X className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {mockNotifications.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">
            You're all caught up! Check back later for new updates.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsContent;
