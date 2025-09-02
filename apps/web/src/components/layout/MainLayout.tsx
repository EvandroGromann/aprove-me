import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  
  const isPayablesActive = location.pathname.includes('/payable') || location.pathname === '/payables';
  const isAssignorsActive = location.pathname.includes('/assignor') || location.pathname === '/assignors';

  return (
    <>
      <header className="bg-white shadow-sm w-full fixed top-0 left-0 right-0 z-10">
        <nav className="h-16 flex items-center justify-between w-[90%] max-w-7xl mx-auto">
          <div className="flex items-center">
            <img src="/logo.png" alt="AproveMe" className="h-8 w-8" />
            <h1 className="text-lg font-semibold ml-3">AproveMe</h1>
          </div>
          
          <div className="flex space-x-8">
            <Link 
              to="/payables" 
              className={`relative ${isPayablesActive ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Pagáveis
              {isPayablesActive && (
                <span className="absolute bottom-[-18px] left-0 right-0 h-0.5 bg-indigo-600"></span>
              )}
            </Link>
            
            <Link 
              to="/assignors" 
              className={`relative ${isAssignorsActive ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Cedentes
              {isAssignorsActive && (
                <span className="absolute bottom-[-18px] left-0 right-0 h-0.5 bg-indigo-600"></span>
              )}
            </Link>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm font-medium"
          >
            Sair
          </button>
        </nav>
      </header>
      
      <main className="pt-20">
        {children}
      </main>
    </>
  );
};

export default MainLayout;
