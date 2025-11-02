import React from 'react';

const Calendar: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
      <p className="mt-4 text-gray-600">
        View your upcoming events and schedule.
      </p>
      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Upcoming Events
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            <li className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Team Meeting
                    </p>
                    <p className="text-sm text-gray-500">
                      Tomorrow at 2:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </li>
            <li className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Project Deadline
                    </p>
                    <p className="text-sm text-gray-500">
                      Friday at 5:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </li>
            <li className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Client Presentation
                    </p>
                    <p className="text-sm text-gray-500">
                      Next Monday at 10:00 AM
                    </p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
