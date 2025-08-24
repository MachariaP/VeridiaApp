// src/components/Sidebar.tsx
import React from 'react';
import { User } from 'firebase/auth';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  setActivePage, 
  darkMode, 
  setDarkMode, 
  user,
  onLogout 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 shadow-md md:w-64 md:h-full flex flex-col items-start space-y-4 fixed md:relative w-full overflow-y-auto z-10">
      <div className="w-full flex justify-between items-center border-b-2 border-gray-200 dark:border-gray-700 pb-4 mb-2">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Chama Hub</h2>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
          {darkMode ? 
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          : 
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          }
        </button>
      </div>
      
      <div className="w-full py-4 border-b border-gray-200 dark:border-gray-700">
        <p className="text-gray-700 dark:text-gray-300 font-medium truncate">{user.displayName || user.email}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
      </div>
      
      <nav className="w-full space-y-2">
        <a href="#" onClick={() => setActivePage('dashboard')} className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${activePage === 'dashboard' ? 'bg-blue-600 dark:bg-blue-400 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Dashboard</a>
        <a href="#" onClick={() => setActivePage('contributions')} className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${activePage === 'contributions' ? 'bg-blue-600 dark:bg-blue-400 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Contributions</a>
        <a href="#" onClick={() => setActivePage('loans')} className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${activePage === 'loans' ? 'bg-blue-600 dark:bg-blue-400 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Loans</a>
        <a href="#" onClick={() => setActivePage('savings')} className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${activePage === 'savings' ? 'bg-blue-600 dark:bg-blue-400 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Savings Goals</a>
        <a href="#" onClick={() => setActivePage('members')} className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${activePage === 'members' ? 'bg-blue-600 dark:bg-blue-400 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Members</a>
        <a href="#" onClick={() => setActivePage('admin')} className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${activePage === 'admin' ? 'bg-blue-600 dark:bg-blue-400 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Admin Settings</a>
        <a href="#" onClick={() => setActivePage('download')} className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${activePage === 'download' ? 'bg-blue-600 dark:bg-blue-400 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Download App</a>
        <a href="#" onClick={onLogout} className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">Log Out</a>
      </nav>
    </div>
  );
};

export default Sidebar;
