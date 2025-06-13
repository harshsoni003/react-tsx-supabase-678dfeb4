import React from 'react';
import { Phone, Clock, PhoneCall, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useElevenLabsStats } from '@/services/elevenlabsApi';

const StatsCards = () => {
  // Use our custom hook to fetch ElevenLabs dashboard data
  const { stats, isLoading, error } = useElevenLabsStats();

  // Data structure for the stats cards
  const statsData = [
    {
      title: 'Total Calls',
      value: stats?.totalCalls || '0',
      change: stats?.totalCallsChange || '0%',
      changeType: 'positive',
      icon: Phone,
    },
    {
      title: 'Total Duration',
      value: stats?.totalDuration || '0h',
      change: stats?.totalDurationChange || '0%',
      changeType: 'positive',
      icon: Clock,
    },
    {
      title: 'Active Calls',
      value: stats?.activeCalls || '0',
      change: stats?.activeCallsChange || '0',
      changeType: 'positive',
      icon: PhoneCall,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-16 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-[#3B82F6] bg-opacity-10 p-3 rounded-lg">
                <div className="h-6 w-6 bg-[#3B82F6] opacity-30 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-xl border border-red-200">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">Failed to load ElevenLabs dashboard data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
            </div>
            <div className="bg-[#3B82F6] bg-opacity-10 p-3 rounded-lg">
              <stat.icon className="h-6 w-6 text-[#3B82F6]" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
