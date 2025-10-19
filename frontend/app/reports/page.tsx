'use client';

import React from 'react';
import { FileText, BarChart } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="w-20 h-20 text-blue-600 dark:text-blue-400 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            View analytics and reports on content verification trends, community activity, and more.
          </p>
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <BarChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                This feature is under construction
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
