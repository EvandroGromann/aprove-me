import { Link, useLocation } from 'react-router-dom';
import { PropsWithChildren } from 'react';

export function Navbar({ right, loggedIn }: { right?: React.ReactNode; loggedIn?: boolean }) {
  const location = useLocation();
  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Aprove-me" className="h-8 w-8" />
          <h1 className="text-lg font-semibold tracking-tight">Aprove-me</h1>
        </div>
        <nav className="hidden sm:flex items-center gap-4">
          {loggedIn && (
            <Link
              to="/payables/new"
              aria-current={location.pathname.startsWith('/payables') ? 'page' : undefined}
              className={`group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tracking-[-0.01em] shadow-sm ring-1 ring-inset transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                location.pathname.startsWith('/payables')
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white ring-transparent shadow-md hover:shadow-lg hover:brightness-95'
                  : 'bg-white text-indigo-700 ring-indigo-300 hover:bg-indigo-50 hover:ring-indigo-400'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`h-4 w-4 ${location.pathname.startsWith('/payables') ? 'opacity-100' : 'text-indigo-700'}`}
                aria-hidden="true"
              >
                <path d="M12 5a.75.75 0 0 1 .75.75V11h5.25a.75.75 0 0 1 0 1.5H12.75v5.25a.75.75 0 0 1-1.5 0V12.5H6a.75.75 0 0 1 0-1.5h5.25V5.75A.75.75 0 0 1 12 5Z" />
              </svg>
              <span>Cadastrar Pagável</span>
              <span className="absolute inset-0 rounded-full ring-2 ring-transparent" />
            </Link>
          )}
        </nav>
        <div>{right}</div>
      </div>
    </header>
  );
}

export function Container({ children }: PropsWithChildren) {
  return <main className="w-[90%] max-w-7xl mx-auto px-2 py-6">{children}</main>;
}
