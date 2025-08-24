// src/components/AdminPage.tsx
import React from 'react';

const AdminPage: React.FC = () => (
  <div className="space-y-8">
    <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">Admin Settings</h1>
    <p className="text-gray-600 dark:text-gray-300">Manage Chama rules, membership, and offboarding.</p>

    <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600 pb-4 mb-6">Chama Rules</h2>
      <div className="space-y-4">
        <div className="mb-6">
          <label htmlFor="loanInterest" className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Loan Interest Rate</label>
          <input type="number" id="loanInterest" placeholder="e.g., 5" required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
        </div>
        <div className="mb-6">
          <label htmlFor="latePenalty" className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Late Payment Penalty</label>
          <input type="number" id="latePenalty" placeholder="e.g., 50" required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
        </div>
        <button className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">Update Rules</button>
      </div>
    </div>
    
    <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600 pb-4 mb-6">Member Management & Offboarding</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Mark Mutua</h3>
          <p className="text-base text-gray-600 dark:text-gray-300 mt-2"><strong>Outstanding Loan:</strong> KSh 20,000</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loan must be settled before offboarding.</p>
          <button className="mt-4 w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">Offboard Member</button>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Susan Wanjiku</h3>
          <p className="text-base text-gray-600 dark:text-gray-300 mt-2"><strong>Balance:</strong> KSh 3,000</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Can be offboarded.</p>
          <button className="mt-4 w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">Offboard Member</button>
        </div>
      </div>
    </div>
  </div>
);

export default AdminPage;
