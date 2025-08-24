// src/components/MembersPage.tsx
import React from 'react';
import { ChamaData } from '../types';

interface MembersPageProps {
  data: ChamaData;
  userId: string;
}

const MembersPage: React.FC<MembersPageProps> = ({ data, userId }) => (
  <div className="space-y-8">
    <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">Chama Members</h1>
    <p className="text-gray-600 dark:text-gray-300">
      View all members and their contributions. This section promotes transparency by providing a "complete visibility" of all group members. Your user ID is: <span className="font-mono text-xs dark:text-gray-400">{userId}</span>
    </p>
    
    <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600 pb-4 mb-6">Invite a New Member</h2>
      <div className="space-y-4">
        <div className="mb-6">
          <label htmlFor="phoneNumber" className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Phone Number (linked to M-Pesa)</label>
          <input type="tel" id="phoneNumber" placeholder="e.g., 0712345678" required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
        </div>
        <button className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">Send Invite via SMS</button>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600 pb-4 mb-6">Current Members</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.members.map((member) => (
          <div key={member.id} className="p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{member.name} {member.role === 'Admin' && <small className="text-sm font-normal text-gray-500 dark:text-gray-400">(Admin)</small>}</h3>
            <p className="text-base text-gray-600 dark:text-gray-300 mt-2"><strong>Balance:</strong> KSh {member.balance.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default MembersPage;
