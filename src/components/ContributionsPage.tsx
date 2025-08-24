// src/components/ContributionsPage.tsx
import React from 'react';

interface ContributionsPageProps {
  handleContribution: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ContributionsPage: React.FC<ContributionsPageProps> = ({ handleContribution }) => (
  <div className="space-y-8">
    <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">Make a Contribution</h1>
    <p className="text-gray-600 dark:text-gray-300">Contribute to the Chama using M-Pesa. This flow is simplified for mobile-first users.</p>
    <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
      <form onSubmit={handleContribution}>
        <div className="mb-6">
          <label htmlFor="amount" className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Amount to Contribute</label>
          <input type="number" id="amount" name="amount" placeholder="e.g., 2000" required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">Contribute via M-Pesa</button>
      </form>
    </div>
  </div>
);

export default ContributionsPage;
