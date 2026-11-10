import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Loader2, GraduationCap, KeyRound, Info } from 'lucide-react';

interface LoginProps {
  onAuthSuccess: () => void;
}

export function Login({ onAuthSuccess }: LoginProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast.success('Вход выполнен успешно!');
        onAuthSuccess();
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('Неверный логин или пароль. Убедитесь, что ввели все правильно и уже зарегистрированы в системе');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: undefined,
        }
      });

      if (error) throw error;

      // Сразу после регистрации входим в систему
      toast.success('Регистрация успешна! Добро пожаловать!');
      onAuthSuccess();
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Обработка специфичных ошибок
      if (error.message?.includes('rate limit')) {
        toast.error('Превышен лимит регистраций. Пожалуйста, попробуйте через час');
      } else if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
        toast.error('Этот email уже зарегистрирован. Попробуйте войти');
      } else {
        toast.error(error.message || 'Ошибка регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Введите email');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Ошибка при отправке письма');
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
          <h1 className="text-xl font-bold text-slate-900 mb-1">PM Simulator</h1>
          <p className="text-sm text-slate-500">Симуляция реальных проектов для продакт-менеджеров</p>

          {/* Learn More Link */}
          <button
            onClick={() => navigate('/welcome')}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors" style={{ color: "#0891b2" }}
          >
            <Info className="w-3.5 h-3.5" />
            Узнать больше о платформе
          </button>
        </div>

        {/* Forgot Password Flow */}
        {showForgotPassword ? (
          <Card className="bg-white/70 backdrop-blur-sm border-white/70 shadow-sm">
            {resetSent ? (
              <CardHeader>
                <div className="flex flex-col items-center text-center gap-3 py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <KeyRound className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Письмо отправлено!</CardTitle>
                  <CardDescription>
                    Мы отправили ссылку для сброса пароля на <strong>{resetEmail}</strong>. Проверьте почту и перейдите по ссылке.
                  </CardDescription>
                  <button
                    onClick={() => { setShowForgotPassword(false); setResetSent(false); setResetEmail(''); }}
                    className="text-sm hover:underline mt-2" style={{ color: "#0891b2" }}
                  >
                    ← Вернуться ко входу
                  </button>
                </div>
              </CardHeader>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <CardHeader>
                  <CardTitle>Восстановление пароля</CardTitle>
                  <CardDescription>Введите email вашего аккаунта — мы пришлём ссылку для сброса пароля.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="your@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-6">
                  <Button type="submit" className="w-full text-white rounded-xl" style={{ background: "#0891b2" }} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Отправить письмо
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-sm text-slate-400 hover:text-slate-600"
                  >
                    ← Вернуться ко входу
                  </button>
                </CardFooter>
              </form>
            )}
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-5" style={{ background: "rgba(207,250,254,0.6)", border: "1px solid rgba(14,116,144,0.2)" }}>
              <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:shadow-sm" style={{ color: "#164e63" }}>Вход</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm" style={{ color: "#164e63" }}>Регистрация</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <Card className="bg-white/70 backdrop-blur-sm border-white/70 shadow-sm">
                <form onSubmit={handleSignIn}>
                  <CardHeader>
                    <CardTitle>Вход в аккаунт</CardTitle>
                    <CardDescription>
                      Введите ваш email и пароль для входа
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Пароль</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-3 pt-6">
                    <Button type="submit" className="w-full text-white rounded-xl" style={{ background: "#111827" }} disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Войти
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-slate-400 transition-colors hover:text-[#0891b2]"
                    >
                      Забыли пароль?
                    </button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <Card className="bg-white/70 backdrop-blur-sm border-white/70 shadow-sm">
                <form onSubmit={handleSignUp}>
                  <CardHeader>
                    <CardTitle>Создать аккаунт</CardTitle>
                    <CardDescription>
                      Зарегистрируйтесь для доступа к платформе
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Пароль</Label>
                      <Input
                        id="signup-password"
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
                      <Label htmlFor="signup-confirm">Подтвердите пароль</Label>
                      <Input
                        id="signup-confirm"
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
                      Зарегистрироваться
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}