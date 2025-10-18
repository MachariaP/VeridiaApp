'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, User, Send, Paperclip, Search, MoreVertical } from 'lucide-react';

// Messages Page Component (Placeholder)
export default function MessagesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => router.push('/dashboard-new')}
            className="text-2xl font-extrabold text-white flex items-center cursor-pointer group"
          >
            <span>Veridia</span><span className="text-indigo-400">App</span>
          </div>
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/profile')}
              className="text-indigo-300 hover:text-white transition duration-200 text-sm flex items-center"
            >
              <User className="w-4 h-4 mr-1" />
              Profile
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex h-[calc(100vh-12rem)]">
          {/* Conversations List (Left Panel) */}
          <div className="w-1/3 border-r border-gray-700 pr-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold flex items-center mb-4">
                <MessageCircle className="w-6 h-6 mr-2 text-indigo-400" />
                Messages
              </h1>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Placeholder Conversations */}
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-white truncate">User {i}</p>
                        <span className="text-xs text-gray-500">2h ago</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        Sample message preview...
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window (Right Panel) */}
          <div className="flex-1 pl-4 flex flex-col">
            {/* Coming Soon Message */}
            <div className="flex-1 flex items-center justify-center bg-gray-800 rounded-lg">
              <div className="text-center p-8">
                <MessageCircle className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Messages Coming Soon</h2>
                <p className="text-gray-400 mb-6 max-w-md">
                  The direct messaging feature is currently under development. 
                  This will allow you to have real-time conversations with other users.
                </p>
                <div className="space-y-2 text-left text-sm text-gray-400 max-w-md mx-auto">
                  <p>✓ One-on-one messaging</p>
                  <p>✓ Real-time message delivery with WebSockets</p>
                  <p>✓ Media attachments (images, documents)</p>
                  <p>✓ Read receipts</p>
                  <p>✓ Message search</p>
                  <p>✓ Typing indicators</p>
                </div>
                <button
                  onClick={() => router.push('/dashboard-new')}
                  className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>

            {/* Message Input (Disabled) */}
            <div className="mt-4 p-4 bg-gray-800 rounded-lg opacity-50">
              <div className="flex items-center space-x-3">
                <button className="text-gray-500 cursor-not-allowed">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Messages are not available yet..."
                  disabled
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-500 rounded-lg cursor-not-allowed"
                />
                <button className="bg-gray-700 text-gray-500 p-2 rounded-lg cursor-not-allowed">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
