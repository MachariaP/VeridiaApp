// src/components/DownloadPage.tsx
import React from 'react';

const DownloadPage: React.FC = () => (
  <div className="space-y-8 text-center p-8">
    <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">Download the App</h1>
    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
      Chama Hub is a Progressive Web App (PWA). This means you can install it directly to your home screen
      without visiting an app store. It will work just like a native app.
    </p>
    
    <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg inline-block text-left">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600 pb-4 mb-6">How to Install</h2>
      <ul className="list-disc list-inside space-y-4 text-gray-700 dark:text-gray-300">
        <li>
          <strong className="text-blue-600 dark:text-blue-400">On Android:</strong>
          <ul className="list-disc list-inside ml-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>Open this page in a modern browser like Chrome.</li>
            <li>Tap the three dots icon in the top-right corner.</li>
            <li>Select "Add to Home screen" and follow the prompts.</li>
          </ul>
        </li>
        <li>
          <strong className="text-blue-600 dark:text-blue-400">On iOS:</strong>
          <ul className="list-disc list-inside ml-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>Open this page in Safari.</li>
            <li>Tap the share icon (a box with an arrow pointing up) at the bottom.</li>
            <li>Scroll down and select "Add to Home Screen".</li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
);

export default DownloadPage;
