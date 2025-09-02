import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiLogin, isTokenExpiringSoon, logout } from '../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const reason = params.get('reason');
  const redirect = params.get('redirect');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpiringSoon(3)) {
      navigate(redirect || '/payables/new', { replace: true });
    } else if (token && isTokenExpiringSoon(3)) {
      logout('session-expired');
    }
  }, [navigate, redirect]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await apiLogin(login, password);
      localStorage.setItem('token', token);
      setLogin('');
      setPassword('');
      navigate(redirect || '/payables/new', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  }

  return (
  <section className="max-w-md mx-auto">
    <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
      <form onSubmit={onSubmit} className="grid gap-3" autoComplete="off">
            <div className="grid gap-1">
              <Label htmlFor="login">Usuário</Label>
        <Input id="login" value={login} onChange={(e) => setLogin(e.target.value)} disabled={loading} required type="text" autoComplete="username" />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required autoComplete="current-password" />
            </div>
            {reason === 'session-expired' && (
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 -mb-1">
                Sua sessão expirou. Faça login novamente para continuar.
              </div>
            )}
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
            {error && <div className="text-sm text-red-600">{error}</div>}
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
