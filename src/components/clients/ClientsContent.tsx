
import React, { useState } from 'react';
import { Search, Plus, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const clientsData = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    lastContact: '2024-06-04',
    totalCalls: 12,
    status: 'Premium',
    avatar: 'SJ'
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    lastContact: '2024-06-03',
    totalCalls: 8,
    status: 'Standard',
    avatar: 'MC'
  },
  {
    id: 3,
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 345-6789',
    location: 'Chicago, IL',
    lastContact: '2024-06-04',
    totalCalls: 15,
    status: 'Premium',
    avatar: 'ED'
  },
  {
    id: 4,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 456-7890',
    location: 'Austin, TX',
    lastContact: '2024-06-01',
    totalCalls: 3,
    status: 'Standard',
    avatar: 'JS'
  },
  {
    id: 5,
    name: 'Lisa Wong',
    email: 'lisa.wong@email.com',
    phone: '+1 (555) 567-8901',
    location: 'Seattle, WA',
    lastContact: '2024-06-02',
    totalCalls: 20,
    status: 'Premium',
    avatar: 'LW'
  },
];

const ClientsContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<typeof clientsData[0] | null>(null);

  const filteredClients = clientsData.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your client relationships and contact information</p>
        </div>
        <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Search */}
            <div className="p-6 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Client List */}
            <div className="divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedClient?.id === client.id ? 'bg-blue-50 border-l-4 border-[#3B82F6]' : ''
                  }`}
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">{client.avatar}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-600">{client.email}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {client.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        client.status === 'Premium' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.status}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{client.totalCalls} calls</p>
                      <p className="text-xs text-gray-500">Last: {client.lastContact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                <p className="text-gray-600">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Detail Panel */}
        <div className="space-y-6">
          {selectedClient ? (
            <>
              {/* Client Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-[#3B82F6] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xl">{selectedClient.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-xl">{selectedClient.name}</h4>
                      <p className="text-sm text-gray-600">{selectedClient.status} Customer</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-3" />
                      {selectedClient.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-3" />
                      {selectedClient.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-3" />
                      {selectedClient.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-3" />
                      Last contact: {selectedClient.lastContact}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Calls:</span>
                      <span className="font-medium text-gray-900">{selectedClient.totalCalls}</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Client
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recent Call History */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Calls</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Inbound Call</p>
                      <p className="text-xs text-gray-600">June 4, 2024 - 14:30</p>
                    </div>
                    <span className="text-sm text-gray-600">12:45</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Outbound Call</p>
                      <p className="text-xs text-gray-600">June 3, 2024 - 10:15</p>
                    </div>
                    <span className="text-sm text-gray-600">8:20</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Inbound Call</p>
                      <p className="text-xs text-gray-600">June 1, 2024 - 16:45</p>
                    </div>
                    <span className="text-sm text-gray-600">22:10</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Client</h3>
              <p className="text-gray-600">Choose a client from the list to view their details and call history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientsContent;
