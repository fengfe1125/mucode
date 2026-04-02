import React, { useState } from 'react';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white mr-4 p-1 rounded-md focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Mu Code</h1>
        </header>
        <main className="flex-1 overflow-hidden relative">
          <Chat />
        </main>
      </div>
    </div>
  );
}

export default App;
