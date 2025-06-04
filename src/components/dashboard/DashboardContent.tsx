
import React from 'react';
import StatsCards from './StatsCards';
import CallHistoryTable from './CallHistoryTable';
import LiveTranscription from './LiveTranscription';
import ClientInfoCard from './ClientInfoCard';

const DashboardContent = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards />
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call History Table */}
        <div className="lg:col-span-2">
          <CallHistoryTable />
        </div>
        
        {/* Right Panel */}
        <div className="space-y-6">
          <LiveTranscription />
          <ClientInfoCard />
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
