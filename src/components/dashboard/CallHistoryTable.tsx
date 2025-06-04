
import React from 'react';
import { Phone, PhoneOff, Clock } from 'lucide-react';

const callHistory = [
  {
    client: 'Sarah Johnson',
    date: '2024-06-04',
    time: '14:30',
    duration: '12:45',
    type: 'Inbound',
    status: 'completed',
  },
  {
    client: 'Mike Chen',
    date: '2024-06-04',
    time: '13:15',
    duration: '8:20',
    type: 'Outbound',
    status: 'completed',
  },
  {
    client: 'Emily Davis',
    date: '2024-06-04',
    time: '12:00',
    duration: '15:30',
    type: 'Inbound',
    status: 'ongoing',
  },
  {
    client: 'John Smith',
    date: '2024-06-04',
    time: '11:45',
    duration: '0:00',
    type: 'Outbound',
    status: 'missed',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <Phone className="h-4 w-4 text-green-600" />;
    case 'ongoing':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'missed':
      return <PhoneOff className="h-4 w-4 text-red-600" />;
    default:
      return <Phone className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusBadge = (status: string) => {
  const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
  switch (status) {
    case 'completed':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'ongoing':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'missed':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

const CallHistoryTable = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Calls</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date/Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {callHistory.map((call, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(call.status)}
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {call.client}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {call.date} {call.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {call.duration}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {call.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(call.status)}>
                    {call.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallHistoryTable;
