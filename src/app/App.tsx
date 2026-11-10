import React, { useState, useEffect, useRef, type FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { WeekView } from './pages/WeekView';
import { ModuleView } from './pages/ModuleView';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { FAQ } from './pages/FAQ';
import { CasePractice } from './pages/CasePractice';
import { Profile } from './pages/Profile';
import { AdminPanel } from './pages/AdminPanel';
import { Onboarding } from './pages/Onboarding';
import { OnboardingLanding } from './pages/OnboardingLanding';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Simulator } from './pages/Simulator';
import { SimulatorGP } from './pages/SimulatorGP';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { courseData } from '@/data/course';
import { Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';
import { initNotifications } from '@/lib/notifications';
import { loadUserProgress, saveUserProgress, migrateLocalProgress } from '@/lib/userProgress';
import { Menu } from 'lucide-react';
import { AIMentor, AIMentorButton } from './components/AIMentor';

// Main Layout Component handling scrolling and sidebar
const MainLayout = ({ progress, markModuleComplete, userName }: { 
    progress: any, 
    markModuleComplete: (id: string) => void,
    userName: string
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAIMentorOpen, setIsAIMentorOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const mainRef = useRef<HTMLDivElement>(null);

    // Check Onboarding
    useEffect(() => {
        const onboardingCompleted = localStorage.getItem('onboarding_completed');
        if (!onboardingCompleted) {
            navigate('/onboarding');
        }
    }, []);

    // Scroll to top on route change
    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [location.pathname]);

    return (
        <div className="flex font-sans overflow-hidden" style={{ color: "#111827", background: "linear-gradient(160deg, #f0fdff 0%, #cffafe 55%, #67e8f9 100%)", height: '100dvh' }}>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-40 flex items-center px-4 shadow-sm" style={{ borderBottom: "1px solid #cffafe" }}>
               <button
                 onClick={() => setIsSidebarOpen(true)}
                 className="p-2 -ml-2 rounded-lg transition-colors hover:bg-[#cffafe]"
               >
                 <Menu className="w-6 h-6" style={{ color: "#164e63" }} />
               </button>
               <span className="ml-3 font-bold text-lg" style={{ color: "#164e63" }}>PM Simulator</span>
            </div>

            {/* Sidebar Wrapper */}
            <div className={`fixed inset-0 z-50 lg:relative lg:z-auto lg:inset-auto lg:flex flex-col h-full transition-visibility duration-300 ${isSidebarOpen ? 'flex' : 'hidden lg:flex'}`}>
                {/* Backdrop */}
                <div 
                  className={`absolute inset-0 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} 
                  onClick={() => setIsSidebarOpen(false)}
                />
                
                {/* Sidebar with Slide Animation */}
                <div className={`relative h-full flex flex-col transition-transform duration-300 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                   <Sidebar progress={progress} onClose={() => setIsSidebarOpen(false)} />
                </div>
            </div>

            <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden pt-16 lg:pt-0 w-full relative z-0 scroll-stable" style={{ WebkitOverflowScrolling: 'touch' } as any}>
              <div className="max-w-5xl mx-auto p-4 lg:p-8 pb-24 lg:pb-8">
                <Routes>
                  <Route path="/" element={<Dashboard progress={progress} userName={userName} />} />
                  <Route path="/week/:weekId" element={<WeekView progress={progress} />} />
                  <Route path="/resources/knowledge" element={<KnowledgeBase />} />
                  <Route path="/resources/knowledge/:articleId" element={<KnowledgeBase />} />
                  <Route path="/resources/faq" element={<FAQ />} />
                  <Route path="/resources/faq/:faqId" element={<FAQ />} />
                  <Route path="/resources/case-practice" element={<CasePractice />} />
                  <Route path="/resources/cases" element={<CasePractice />} />
                  <Route path="/resources/cases/:caseId" element={<CasePractice />} />
                  <Route path="/profile" element={<Profile progress={progress} />} />
                  <Route 
                    path="/module/:moduleId" 
                    element={<ModuleView progress={progress} onComplete={markModuleComplete} />} 
                  />
                </Routes>
              </div>
            </main>
            <AIMentorButton onClick={() => setIsAIMentorOpen(true)} isOpen={isAIMentorOpen} />
            <AIMentor isOpen={isAIMentorOpen} onClose={() => setIsAIMentorOpen(false)} />
            <Toaster position="top-center" />
        </div>
    );
};

// /admin — отдельная панель владельца, вход по паролю администратора (не по аккаунту пользователя).
export default function App() {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return (<><AdminPanel /><Toaster position="top-center" /></>);
  }
  return <MainApp />;
}

function MainApp() {
  // Init push notifications on mount (respects saved preference & permission)
  useEffect(() => { initNotifications(); }, []);

  // Fix mobile keyboard viewport jump: sync --vh to visualViewport height
  useEffect(() => {
    const setVh = () => {
      const vh = (window.visualViewport?.height ?? window.innerHeight) * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.visualViewport?.addEventListener('resize', setVh);
    window.visualViewport?.addEventListener('scroll', setVh);
    window.addEventListener('resize', setVh);
    return () => {
      window.visualViewport?.removeEventListener('resize', setVh);
      window.visualViewport?.removeEventListener('scroll', setVh);
      window.removeEventListener('resize', setVh);
    };
  }, []);

  const [progress, setProgress] = useState<Record<string, 'locked' | 'unlocked' | 'completed'>>({});
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  const checkUserAccess = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data: access } = await supabase
        .from('user_access')
        .select('plan, expires_at, status')
        .eq('user_id', user.id)
        .eq('project', 'simulator product')
        .eq('status', 'active')
        .maybeSingle();
      if (!access) return false;
      return (
        access.plan === 'lifetime' ||
        !access.expires_at ||
        new Date(access.expires_at) > new Date()
      );
    } catch {
      return false;
    }
  };

  const extractUserName = (user: any): string => {
    if (user?.user_metadata?.name) return user.user_metadata.name.split(' ')[0];
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'PM';
  };

  // Check Authentication Status
  useEffect(() => {
    console.log('🚀 Starting auth check...');

    // ── Helper: wipe stale/invalid session locally ──────────────────────────
    const clearStaleSession = async () => {
      console.log('🧹 Clearing stale session from localStorage...');
      localStorage.removeItem('pm-academy-auth');
      try {
        // scope:'local' avoids a server call that would fail for an invalid token
        await supabase.auth.signOut({ scope: 'local' });
      } catch (_) { /* ignore – we're already cleaning up */ }
      setIsAuthenticated(false);
      setCheckingAuth(false);
    };

    // ── Guard against unhandled promise rejections from the bg auto-refresh ─
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg: string = event.reason?.message ?? '';
      if (msg.includes('Refresh Token Not Found') || msg.includes('Invalid Refresh Token')) {
        console.warn('⚠️ Caught unhandled auth rejection – clearing stale session');
        event.preventDefault(); // silence the console error
        clearStaleSession();
      }
    };
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    // ── Listen to auth changes (register BEFORE the first async call) ────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in:', session.user.email);
        setIsAuthenticated(true);
        setUserName(extractUserName(session.user));
        migrateLocalProgress().catch(err => console.warn('Migration failed:', err));
        checkUserAccess().then(ok => setHasAccess(ok));
      } else if (event === 'SIGNED_OUT') {
        console.log('❌ User signed out');
        setIsAuthenticated(false);
        setHasAccess(null);
        setProgress({});
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
        setIsAuthenticated(true);
      } else if (event === 'INITIAL_SESSION') {
        // Handled below in checkAuth; ignore here to avoid double-init
      }
    });

    const checkAuth = async () => {
      setCheckingAuth(true);

      // КРИТИЧЕСКИ ВАЖНО: таймаут на всю проверку
      const authTimeout = setTimeout(() => {
        console.warn('⚠️ Auth check timeout (2s) - using localStorage fallback');
        const localSession = localStorage.getItem('pm-academy-auth');
        console.log('localStorage pm-academy-auth:', localSession ? 'exists' : 'not found');
        setIsAuthenticated(!!localSession);
        setCheckingAuth(false);
      }, 2000); // Максимум 2 секунды на проверку

      try {
        console.log('📡 Calling supabase.auth.getSession()...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📡 getSession returned:', { hasSession: !!session, hasError: !!error });

        clearTimeout(authTimeout);

        if (error) {
          console.error('❌ Auth error:', error);
          if (
            error.message.includes('Refresh Token Not Found') ||
            error.message.includes('Invalid Refresh Token')
          ) {
            await clearStaleSession();
          } else {
            console.log('🔍 Checking localStorage for fallback...');
            const localSession = localStorage.getItem('pm-academy-auth');
            console.log('localStorage pm-academy-auth:', localSession ? 'exists' : 'not found');
            setIsAuthenticated(!!localSession);
          }
        } else if (session?.user) {
          console.log('✅ User authenticated:', session.user.email);
          setIsAuthenticated(true);
          setUserName(extractUserName(session.user));
          migrateLocalProgress().catch(err => console.warn('Migration failed:', err));
          checkUserAccess().then(ok => setHasAccess(ok));
        } else {
          console.log('❌ No active session');
          setIsAuthenticated(false);
        }
      } catch (error: any) {
        clearTimeout(authTimeout);
        console.error('💥 Auth check crashed:', error);

        // Catch the token error even if it surfaces as a thrown exception
        if (
          error?.message?.includes('Refresh Token Not Found') ||
          error?.message?.includes('Invalid Refresh Token')
        ) {
          await clearStaleSession();
        } else {
          const localSession = localStorage.getItem('pm-academy-auth');
          console.log('localStorage pm-academy-auth:', localSession ? 'exists' : 'not found');
          setIsAuthenticated(!!localSession);
        }
      } finally {
        console.log('✅ Auth check complete, setting checkingAuth = false');
        setCheckingAuth(false);
      }
    };

    checkAuth();

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  // Initial Progress Setup
  const initProgress = async () => {
    setLoadingProgress(true);
    
    // Default initial state
    const defaultProgress: any = {};
    courseData.forEach(week => {
      week.modules.forEach(m => {
        defaultProgress[m.id] = 'unlocked';
      });
    });

    try {
      // Добавляем timeout для загрузки прогресса
      const progressTimeout = setTimeout(() => {
        console.warn('⚠️ Progress load timeout - using default');
        setProgress(defaultProgress);
        setLoadingProgress(false);
      }, 2000); // Максимум 2 секунды

      const loadedProgress = await loadUserProgress(defaultProgress);
      clearTimeout(progressTimeout);
      setProgress(loadedProgress);
      setLoadingProgress(false);
    } catch (error) {
      console.error('Failed to load progress:', error);
      setProgress(defaultProgress);
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      initProgress();
    }
  }, [isAuthenticated]);

  // Sync to Server on Change
  useEffect(() => {
    if (loadingProgress || !isAuthenticated) return;

    const syncProgress = async () => {
      await saveUserProgress(progress);
    };

    // Debounce sync slightly
    const timer = setTimeout(syncProgress, 1000);
    return () => clearTimeout(timer);
  }, [progress, loadingProgress, isAuthenticated]);

  const markModuleComplete = (moduleId: string) => {
    const newProgress = { ...progress, [moduleId]: 'completed' };
    let foundCurrent = false;
    let nextModuleId = null;
    const allModules = courseData.flatMap(w => w.modules);
    
    for (const m of allModules) {
      if (foundCurrent) {
        nextModuleId = m.id;
        break;
      }
      if (m.id === moduleId) foundCurrent = true;
    }

    if (nextModuleId) {
      // Only unlock if not already completed or unlocked (keep existing state)
      if (!newProgress[nextModuleId]) newProgress[nextModuleId] = 'unlocked';
    }

    setProgress(newProgress);
  };

  const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f0fdff 0%, #cffafe 55%, #67e8f9 100%)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4" style={{ borderColor: '#0891b2' }} />
        <p className="text-sm" style={{ color: '#0e7490' }}>Загрузка...</p>
      </div>
    </div>
  );

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<OnboardingLanding />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<LoadingScreen />} />
        </Routes>
        <Toaster position="top-center" />
      </BrowserRouter>
    );
  }

  // Show login / landing if not authenticated
  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome" element={<OnboardingLanding />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/login" element={<Login onAuthSuccess={() => setIsAuthenticated(true)} />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
        <Toaster position="top-center" />
      </BrowserRouter>
    );
  }

  // Authenticated but access not yet resolved — show loading
  if (hasAccess === null) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/welcome" element={<OnboardingLanding />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<LoadingScreen />} />
        </Routes>
        <Toaster position="top-center" />
      </BrowserRouter>
    );
  }

  // Authenticated but no active subscription — show pricing
  if (hasAccess === false) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome" element={<OnboardingLanding />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
        <Toaster position="top-center" />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
          {/* Public pages */}
          <Route path="/welcome" element={<OnboardingLanding />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          {/* Onboarding Route */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* App Routes */}
          <Route path="/simulator" element={<Navigate to="/simulator/fintech" replace />} />
          <Route path="/simulator/:scenarioId" element={<Simulator />} />
          <Route path="/simulator/gp/course" element={<SimulatorGP />} />
          <Route path="*" element={
            <MainLayout
              progress={progress}
              markModuleComplete={markModuleComplete}
              userName={userName}
            />
          } />
      </Routes>
    </BrowserRouter>
  );
}