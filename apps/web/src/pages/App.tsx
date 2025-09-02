import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, Container } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';

export default function App() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  return (
    <div className="min-h-screen">
      <Navbar
        loggedIn={!!token}
        right={
          <div className="flex gap-2">
            {!token && (
              <Button
                variant="primary"
                onClick={() => {
                  if (location.pathname !== '/login') window.location.href = '/login';
                }}
              >
                Entrar
              </Button>
            )}
            {token && (
              <Button
                variant="secondary"
                onClick={() => {
                  localStorage.removeItem('token');
                  if (location.pathname !== '/login') window.location.href = '/login';
                }}
              >
                Sair
              </Button>
            )}
          </div>
        }
      />
      <Container>
        <Outlet />
      </Container>
    </div>
  );
}
