import React from 'react';

const Reports: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      <p className="mt-4 text-gray-600">
        View analytics and generate reports.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Monthly Analytics</h3>
            <div className="mt-4">
              <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-500">Chart placeholder</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">User Activity</h3>
            <div className="mt-4">
              <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-500">Chart placeholder</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Page Load Time</span>
                <span className="text-sm font-medium">1.2s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-sm font-medium">3.4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bounce Rate</span>
                <span className="text-sm font-medium">45%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Revenue Summary</h3>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">$24,567</div>
              <p className="text-sm text-gray-600">Total revenue this month</p>
              <div className="mt-2">
                <span className="text-green-600 text-sm font-medium">+12.5%</span>
                <span className="text-gray-500 text-sm ml-1">from last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
