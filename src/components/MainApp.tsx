// src/components/MainApp.tsx
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import Sidebar from './Sidebar';
import DashboardPage from './DashboardPage';
import ContributionsPage from './ContributionsPage';
import LoansPage from './LoansPage';
import SavingsPage from './SavingsPage';
import MembersPage from './MembersPage';
import AdminPage from './AdminPage';
import DownloadPage from './DownloadPage';
import Toast from './Toast';
import LoadingSpinner from './LoadingSpinner';
import { ChamaData } from '../types';

interface MainAppProps {
  user: User;
  onLogout: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [appId, setAppId] = useState<string | null>(null);
  const [chamaData, setChamaData] = useState<ChamaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    setAppId(currentAppId);

    if (!appId) return;

    const dataPath = `artifacts/${appId}/public/data/chamaData`;
    const docRef = doc(db, dataPath, 'chama_data');

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ChamaData;
        setChamaData(data);
        console.log("Real-time data received:", data);
      } else {
        console.log("Chama data document not found. Creating a new one.");
        setDoc(docRef, {
          totalBalance: 150000,
          members: [
            { id: '1', name: 'Jane Doe', role: 'Admin', balance: 5000, loans: [] },
            { id: '2', name: 'John Mwangi', role: 'Member', balance: 12000, loans: [] },
            { id: '3', name: 'Mary Ochieng', role: 'Member', balance: 10000, loans: [] },
            { id: '4', name: 'Peter Kimani', role: 'Member', balance: 0, loans: [] },
          ],
          contributions: [
            { id: 'c1', member: 'Mary Ochieng', amount: 1000, timestamp: Date.now(), txId: 'M-PESA-X123456789' },
            { id: 'c2', member: 'John Mwangi', amount: 2500, timestamp: Date.now(), txId: 'M-PESA-Y987654321', type: 'loan-repayment' },
          ],
          loans: [
            { id: 'l1', member: 'Peter Kimani', amount: 15000, status: 'pending', reason: 'Business capital' },
            { id: 'l2', member: 'Mary Njoroge', amount: 8000, status: 'pending', reason: 'Medical expenses' },
          ],
          savingsGoals: {
            landPurchase: { target: 5000000, current: 2500000 },
          },
        }).then(() => console.log("Default Chama data created."));
      }
      setLoading(false);
    }, (error) => {
      console.error("Failed to listen for data:", error);
      setMessage("Failed to fetch real-time data. Check your network connection.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [appId]);

  const handleContribution = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const amount = parseInt(e.currentTarget.amount.value, 10);
    if (!amount || isNaN(amount) || amount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    try {
      const dataPath = `artifacts/${appId}/public/data/chamaData`;
      const docRef = doc(db, dataPath, 'chama_data');

      const newContribution = {
        member: user.displayName || 'Jane Doe',
        amount: amount,
        timestamp: Date.now(),
        txId: 'M-PESA-' + Math.random().toString(36).substring(2, 11).toUpperCase(),
      };
      const updatedContributions = [...(chamaData?.contributions || []), newContribution];
      const newBalance = (chamaData?.totalBalance || 0) + amount;

      await updateDoc(docRef, {
        totalBalance: newBalance,
        contributions: updatedContributions,
      });

      setMessage(`Successfully contributed KSh ${amount}.`);
      e.currentTarget.reset();
    } catch (error) {
      console.error("Failed to add contribution:", error);
      setMessage("Failed to add contribution. Please try again.");
    }
  };

  const renderPage = () => {
    if (loading) {
      return <LoadingSpinner />;
    }
    if (!chamaData) {
      return (
        <div className="flex items-center justify-center h-full text-lg text-gray-500">
          Chama data not found.
        </div>
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <DashboardPage data={chamaData} userId={user.uid} />;
      case 'contributions':
        return <ContributionsPage handleContribution={handleContribution} />;
      case 'loans':
        return <LoansPage data={chamaData} />;
      case 'savings':
        return <SavingsPage data={chamaData} />;
      case 'members':
        return <MembersPage data={chamaData} userId={user.uid} />;
      case 'admin':
        return <AdminPage />;
      case 'download':
        return <DownloadPage />;
      default:
        return <DashboardPage data={chamaData} userId={user.uid} />;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row h-screen font-inter ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {message && <Toast message={message} onClose={() => setMessage('')} />}
      
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        user={user}
        onLogout={onLogout}
      />
      
      <main className="flex-1 p-8 md:ml-64 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default MainApp;
