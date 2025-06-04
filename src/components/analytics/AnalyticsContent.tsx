
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, TrendingUp, TrendingDown, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const callVolumeData = [
  { month: 'Jan', calls: 120, duration: 1800 },
  { month: 'Feb', calls: 150, duration: 2100 },
  { month: 'Mar', calls: 180, duration: 2400 },
  { month: 'Apr', calls: 200, duration: 2800 },
  { month: 'May', calls: 190, duration: 2600 },
  { month: 'Jun', calls: 220, duration: 3200 }
];

const callTrendData = [
  { date: '06/01', inbound: 45, outbound: 32 },
  { date: '06/02', inbound: 52, outbound: 28 },
  { date: '06/03', inbound: 48, outbound: 35 },
  { date: '06/04', inbound: 61, outbound: 42 },
  { date: '06/05', inbound: 55, outbound: 38 },
  { date: '06/06', inbound: 67, outbound: 45 },
  { date: '06/07', inbound: 59, outbound: 41 }
];

const callTypeData = [
  { name: 'Support', value: 40, color: '#3B82F6' },
  { name: 'Sales', value: 30, color: '#60A5FA' },
  { name: 'Follow-up', value: 20, color: '#93C5FD' },
  { name: 'Other', value: 10, color: '#DBEAFE' }
];

const performanceMetrics = [
  {
    title: 'Average Call Duration',
    value: '14:32',
    change: '+5.2%',
    changeType: 'positive',
    icon: Clock
  },
  {
    title: 'Call Success Rate',
    value: '89.5%',
    change: '+2.1%',
    changeType: 'positive',
    icon: TrendingUp
  },
  {
    title: 'Missed Calls',
    value: '23',
    change: '-12.3%',
    changeType: 'negative',
    icon: TrendingDown
  },
  {
    title: 'Response Time',
    value: '2.3s',
    change: '-8.7%',
    changeType: 'negative',
    icon: Phone
  }
];

const AnalyticsContent = () => {
  const [dateRange, setDateRange] = useState('7d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your call performance and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <div className="flex items-center mt-1">
                  {metric.changeType === 'positive' ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <p className={`text-sm ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </p>
                </div>
              </div>
              <div className="bg-[#3B82F6] bg-opacity-10 p-3 rounded-lg">
                <metric.icon className="h-6 w-6 text-[#3B82F6]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Volume Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Volume Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={callVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="calls" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Call Types Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={callTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {callTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Call Trends */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Call Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={callTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="inbound" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              name="Inbound Calls"
            />
            <Line 
              type="monotone" 
              dataKey="outbound" 
              stroke="#60A5FA" 
              strokeWidth={3}
              dot={{ fill: '#60A5FA', strokeWidth: 2, r: 4 }}
              name="Outbound Calls"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#3B82F6]">1,247</p>
            <p className="text-sm text-gray-600">Total Calls This Month</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#60A5FA]">89.2h</p>
            <p className="text-sm text-gray-600">Total Talk Time</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">94.3%</p>
            <p className="text-sm text-gray-600">Overall Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsContent;
