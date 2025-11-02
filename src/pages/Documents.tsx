import React from 'react';

const Documents: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
      <p className="mt-4 text-gray-600">
        Manage your documents and files.
      </p>
      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            <li className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-red-100 rounded-md flex items-center justify-center">
                    <span className="text-red-600 text-sm">📄</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">Project Proposal.pdf</div>
                  <div className="text-sm text-gray-500">2.4 MB • Updated 2 hours ago</div>
                </div>
                <div className="ml-auto">
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    Download
                  </button>
                </div>
              </div>
            </li>
            <li className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">Q4 Report.xlsx</div>
                  <div className="text-sm text-gray-500">1.8 MB • Updated yesterday</div>
                </div>
                <div className="ml-auto">
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    Download
                  </button>
                </div>
              </div>
            </li>
            <li className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-md flex items-center justify-center">
                    <span className="text-green-600 text-sm">📝</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">Meeting Notes.docx</div>
                  <div className="text-sm text-gray-500">456 KB • Updated 3 days ago</div>
                </div>
                <div className="ml-auto">
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    Download
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Documents;
