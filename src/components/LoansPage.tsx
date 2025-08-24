// src/components/LoansPage.tsx
import React from 'react';
import { ChamaData } from '../types';

interface LoansPageProps {
  data: ChamaData;
}

const LoansPage: React.FC<LoansPageProps> = ({ data }) => (
  <div className="space-y-8">
    <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">Loans</h1>
    <p className="text-gray-600 dark:text-gray-300">Manage your group's loans and requests with transparent visibility for all members.</p>
    
    <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600 pb-4 mb-6">Request a Loan</h2>
      <div className="space-y-4">
        <div className="mb-6">
          <label htmlFor="loanAmount" className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Loan Amount</label>
          <input type="number" id="loanAmount" placeholder="e.g., 10000" required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
          <small className="text-gray-500 dark:text-gray-400 mt-1 block">Max eligible loan: KSh 25,000 (based on Chama rules).</small>
        </div>
        <div className="mb-6">
          <label htmlFor="repaymentPeriod" className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Repayment Period</label>
          <input type="text" id="repaymentPeriod" placeholder="e.g., 3 months" required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
        </div>
        <button className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">Submit Loan Request</button>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600 pb-4 mb-6">Pending Loan Requests (Admin View)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.loans.filter(loan => loan.status === 'pending').map((loan) => (
          <div key={loan.id} className="p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{loan.member}</h3>
            <p className="text-base text-gray-600 dark:text-gray-300 mt-2"><strong>Amount:</strong> KSh {loan.amount.toLocaleString()}</p>
            <p className="text-base text-gray-600 dark:text-gray-300"><strong>Reason:</strong> {loan.reason}</p>
            <div className="mt-4 flex items-center space-x-2">
              <button className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">Approve</button>
              <button className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">Reject</button>
              <span className="inline-block px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-200 rounded-full dark:bg-yellow-800 dark:text-yellow-200">Pending Admin Approval</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LoansPage;
