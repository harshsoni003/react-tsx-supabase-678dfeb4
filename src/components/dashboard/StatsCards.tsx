
import React from 'react';
import { Phone, Clock, PhoneCall } from 'lucide-react';

const statsData = [
  {
    title: 'Total Calls',
    value: '1,247',
    change: '+12%',
    changeType: 'positive',
    icon: Phone,
  },
  {
    title: 'Total Duration',
    value: '89.2h',
    change: '+8%',
    changeType: 'positive',
    icon: Clock,
  },
  {
    title: 'Active Calls',
    value: '23',
    change: '+3',
    changeType: 'positive',
    icon: PhoneCall,
  },
];

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
