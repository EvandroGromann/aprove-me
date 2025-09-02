import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Container } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';

export default function App() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  // Redirect to payables list if logged in and at root
  if (token && location.pathname === '/') {
    return <Navigate to="/payables" replace />;
  }
  
  // Login page doesn't use MainLayout, so we only need this simple container
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen">
      {isLoginPage && (
        <header className="bg-white border-b">
          <div className="w-[90%] max-w-7xl mx-auto py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Aprove-me" className="h-8 w-8" />
              <h1 className="text-lg font-semibold tracking-tight">AproveMe</h1>
            </div>
            <div>
              <Button
                variant="primary"
                onClick={() => {}}
              >
                Entrar
              </Button>
            </div>
          </div>
        </header>
      )}
      <Container>
        <Outlet />
      </Container>
    </div>
  );
}
