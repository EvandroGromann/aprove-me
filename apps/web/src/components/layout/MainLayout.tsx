import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expires_at');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AproveMe</h1>
              <div className="ml-10 space-x-4">
                <Link to="/create-payable" className="text-gray-600 hover:text-gray-900">
                  Títulos
                </Link>
                <Link to="/create-assignor" className="text-gray-600 hover:text-gray-900">
                  Cedentes
                </Link>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Sair
            </button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default MainLayout;
