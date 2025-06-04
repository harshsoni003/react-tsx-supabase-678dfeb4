
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ClientInfoCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Client</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">EK</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Emily Davis</h4>
            <p className="text-sm text-gray-600">Premium Customer</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-3" />
            emily.davis@email.com
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-3" />
            +1 (555) 123-4567
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-3" />
            New York, NY
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Calls:</span>
            <span className="font-medium text-gray-900">12</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">Last Contact:</span>
            <span className="font-medium text-gray-900">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfoCard;
