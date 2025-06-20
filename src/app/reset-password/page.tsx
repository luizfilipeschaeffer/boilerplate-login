'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token de redefinição não encontrado na URL.');
    }
  }, [token]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setSuccess(data.message);
      } else {
        toast.error(data.message || 'Ocorreu um erro.');
        setError(data.message);
      }
    } catch {
      toast.error('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crie sua Nova Senha</CardTitle>
        <CardDescription>
          Digite e confirme sua nova senha abaixo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <p className="text-center text-green-600">{success}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !!error || !token}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !!error || !token}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !token}>
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}


export default function ResetPasswordPage() {
  return (
    <>
      <Toaster richColors />
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Suspense fallback={<div>Carregando...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </>
  )
} 