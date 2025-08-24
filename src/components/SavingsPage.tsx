// src/components/SavingsPage.tsx
import React from 'react';
import { ChamaData } from '../types';

interface SavingsPageProps {
  data: ChamaData;
}

const SavingsPage: React.FC<SavingsPageProps> = ({ data }) => (
  <div className="space-y-8">
    <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">Savings Goals</h1>
    <p className="text-gray-600 dark:text-gray-300">Manage both short-term individual savings and long-term group investments.</p>
    
    <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600 pb-4 mb-6">Long-Term Group Goal: Land Purchase</h2>
      <div className="space-y-4">
        <p className="text-base text-gray-600 dark:text-gray-300"><strong>Target:</strong> KSh {data.savingsGoals.landPurchase.target.toLocaleString()}</p>
        <p className="text-base text-gray-600 dark:text-gray-300"><strong>Current:</strong> KSh {data.savingsGoals.landPurchase.current.toLocaleString()}</p>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4">
          <div
            className="bg-blue-600 dark:bg-blue-400 h-4 rounded-full"
            style={{ width: `${(data.savingsGoals.landPurchase.current / data.savingsGoals.landPurchase.target) * 100}%` }}
          ></div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Progress towards goal.</p>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600 pb-4 mb-6">Short-Term Individual Funds</h2>
      <p className="text-base text-gray-600 dark:text-gray-300">This is your individual balance, available for withdrawal based on Chama rules.</p>
      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-4">Your Balance: KSh {data.members.find(m => m.id === '1')?.balance.toLocaleString() || 0}</p>
      <button className="mt-4 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">Request Withdrawal</button>
    </div>
  </div>
);

export default SavingsPage;
