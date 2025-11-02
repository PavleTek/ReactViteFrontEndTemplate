import React from 'react';

const Projects: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
      <p className="mt-4 text-gray-600">
        View and manage your projects.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Website Redesign</h3>
            <p className="mt-2 text-sm text-gray-500">
              Complete redesign of the company website with modern UI/UX.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                In Progress
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Mobile App</h3>
            <p className="mt-2 text-sm text-gray-500">
              Development of a new mobile application for iOS and Android.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Planning
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">API Integration</h3>
            <p className="mt-2 text-sm text-gray-500">
              Integration with third-party APIs for enhanced functionality.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Review
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
