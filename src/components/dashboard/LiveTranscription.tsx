
import React from 'react';

const LiveTranscription = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Live Transcription</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Recording</span>
        </div>
      </div>
      
      <div className="bg-[#F5F7FA] rounded-lg p-4 h-48 overflow-y-auto">
        <div className="space-y-3 text-sm">
          <div className="flex">
            <span className="text-[#3B82F6] font-medium mr-2">Agent:</span>
            <span className="text-gray-700">Hello, thank you for calling. How can I assist you today?</span>
          </div>
          <div className="flex">
            <span className="text-green-600 font-medium mr-2">Client:</span>
            <span className="text-gray-700">Hi, I'm having trouble with my recent order. The delivery was supposed to arrive yesterday.</span>
          </div>
          <div className="flex">
            <span className="text-[#3B82F6] font-medium mr-2">Agent:</span>
            <span className="text-gray-700">I apologize for the inconvenience. Let me look up your order details. Can you please provide me with your order number?</span>
          </div>
          <div className="flex">
            <span className="text-green-600 font-medium mr-2">Client:</span>
            <span className="text-gray-700">Sure, it's ORD-2024-1234.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTranscription;
