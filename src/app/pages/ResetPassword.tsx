import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Loader2, GraduationCap } from 'lucide-react';

export function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session from password reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error('Недействительная или истекшая ссылка');
        navigate('/');
      }
    });
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success('Пароль успешно изменен!');
      navigate('/');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.message || 'Ошибка при изменении пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: "linear-gradient(160deg, #f0fdff 0%, #cffafe 55%, #67e8f9 100%)" }}>
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #0891b2, #0e7490)", boxShadow: "0 4px 12px rgba(8,145,178,0.3)" }}>
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Новый пароль</h1>
          <p className="text-sm text-slate-500">Введите новый пароль для вашего аккаунта</p>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-white/70 shadow-sm">
          <form onSubmit={handleResetPassword}>
            <CardHeader>
              <CardTitle>Создание нового пароля</CardTitle>
              <CardDescription>
                Пароль должен содержать минимум 6 символов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="new-password">Новый пароль</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-6">
              <Button type="submit" className="w-full text-white rounded-xl" style={{ background: "#0891b2" }} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Изменить пароль
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}