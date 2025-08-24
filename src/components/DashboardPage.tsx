// src/components/DashboardPage.tsx
import React from 'react';
import { ChamaData } from '../types';

interface DashboardPageProps {
  data: ChamaData;
  userId: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ data, userId }) => {
  const myBalance = data.members.find(m => m.id === '1')?.balance || 0;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">Chama Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Welcome, {data.members.find(m => m.role === 'Admin')?.name || 'Admin'}! Here's an overview of your group's finances. Your User ID is: <span className="font-mono text-xs dark:text-gray-400">{userId}</span>
      </p>

      <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600 pb-4 mb-6">Group Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Total Chama Balance</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">KSh {data.totalBalance.toLocaleString()}</p>
            <small className="text-gray-500 dark:text-gray-400">Real-time visibility for all members.</small>
          </div>
          <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">My Individual Balance</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">KSh {myBalance.toLocaleString()}</p>
            <small className="text-gray-500 dark:text-gray-400">Your short-term savings.</small>
          </div>
          <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Active Loans</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{data.loans.length} outstanding loans</p>
            <small className="text-gray-500 dark:text-gray-400">Total KSh {data.loans.reduce((acc, loan) => acc + loan.amount, 0).toLocaleString()} borrowed.</small>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600 pb-4 mb-6">Recent Activity (Transparent Ledger)</h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-600">
          {data.contributions.map((item) => (
            <li key={item.id} className="py-4">
              <p className="text-base font-medium dark:text-white">
                <strong>{item.member}:</strong> {item.type === 'loan-repayment' ? `Repaid Loan Installment of KSh ${item.amount.toLocaleString()}` : `Contributed KSh ${item.amount.toLocaleString()}`}
              </p>
              <small className="text-gray-500 dark:text-gray-400">Transaction ID: {item.txId}</small>
            </li>
          ))}
          {data.loans.filter(l => l.status === 'pending').map(loan => (
            <li key={loan.id} className="py-4">
              <p className="text-base font-medium dark:text-white">
                <strong>Admin:</strong> Approved Loan Request for {loan.member}
              </p>
              <small className="text-gray-500 dark:text-gray-400">Amount: KSh {loan.amount.toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
