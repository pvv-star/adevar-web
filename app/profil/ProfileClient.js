'use client';
import { useState } from 'react';
import { Settings, LogOut, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { useRouter } from 'next/navigation';

const UI_TEXT = {
  ro: {
    profile: 'Profil',
    free: 'Cont gratuit',
    premium: 'Premium',
    upgrade: 'Treci la Premium — 50 lei/lună',
    manageSub: 'Gestionează abonamentul',
    signOut: 'Deconectare',
    questionsToday: 'Întrebări AI azi',
    unlimited: 'Nelimitat',
    member: 'Membru din',
    notLoggedIn: 'Nu sunteți autentificat',
    goToLogin: 'Autentificare',
    loading: 'Se încarcă...',
    upgradeDesc: 'Întrebări AI nelimitate cu Claude, fără limite zilnice.',
  },
  en: {
    profile: 'Profile',
    free: 'Free account',
    premium: 'Premium',
    upgrade: 'Upgrade to Premium — 50 lei/month',
    manageSub: 'Manage subscription',
    signOut: 'Sign out',
    questionsToday: 'AI questions today',
    unlimited: 'Unlimited',
    member: 'Member since',
    notLoggedIn: 'You are not signed in',
    goToLogin: 'Sign in',
    loading: 'Loading...',
    upgradeDesc: 'Unlimited AI questions powered by Claude, no daily limits.',
  },
  ru: {
    profile: 'Профиль',
    free: 'Бесплатный аккаунт',
    premium: 'Премиум',
    upgrade: 'Перейти на Премиум — 50 лей/месяц',
    manageSub: 'Управление подпиской',
    signOut: 'Выйти',
    questionsToday: 'AI вопросов сегодня',
    unlimited: 'Без лимита',
    member: 'Участник с',
    notLoggedIn: 'Вы не авторизованы',
    goToLogin: 'Войти',
    loading: 'Загрузка...',
    upgradeDesc: 'Неограниченные AI-вопросы с Claude, без дневных лимитов.',
  },
};

export default function ProfileClient() {
  const { user, profile, loading, signOut, getAccessToken } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const texts = UI_TEXT[lang] || UI_TEXT.ro;
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-white">
        <Loader2 size={24} className="animate-spin text-[#14B8A6]" />
        <span className="ml-2 text-gray-400" style={{ fontSize: '0.875rem' }}>{texts.loading}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh bg-white gap-4">
        <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>{texts.notLoggedIn}</p>
        <button
          onClick={() => router.push('/autentificare')}
          className="bg-[#14B8A6] text-white px-6 py-3 rounded-xl hover:bg-[#0D9488] transition-colors"
          style={{ fontSize: '0.875rem', fontWeight: 600 }}
        >
          {texts.goToLogin}
        </button>
      </div>
    );
  }

  const isPremium = profile?.tier === 'premium';
  const displayName = profile?.display_name || user.email?.split('@')[0] || '';
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'ro-RO', { year: 'numeric', month: 'long' })
    : '';

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silent fail
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleManageSub = async () => {
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silent fail
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="flex flex-col h-dvh bg-white overflow-y-auto pb-20">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{texts.profile}</h2>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Settings size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="flex flex-col items-center px-5 pt-4 pb-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3 ring-2 ring-[#14B8A6] ring-offset-2 bg-[#14B8A6] flex items-center justify-center">
          <span className="text-white" style={{ fontSize: '2rem', fontWeight: 700 }}>
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{displayName}</h3>
        <p className="text-gray-400" style={{ fontSize: '0.75rem' }}>{user.email}</p>

        {/* Tier badge */}
        <div className={`mt-3 px-4 py-1.5 rounded-full flex items-center gap-1.5 ${
          isPremium ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {isPremium && <Crown size={14} />}
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {isPremium ? texts.premium : texts.free}
          </span>
        </div>

        {memberSince && (
          <p className="text-gray-400 mt-2" style={{ fontSize: '0.7rem' }}>
            {texts.member} {memberSince}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="mx-5 mb-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex justify-between items-center">
          <span className="text-gray-500" style={{ fontSize: '0.8rem' }}>{texts.questionsToday}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {isPremium ? texts.unlimited : `${profile?.ai_questions_today || 0} / 10`}
          </span>
        </div>
      </div>

      {/* Upgrade / Manage */}
      <div className="px-5 space-y-3">
        {!isPremium ? (
          <div className="p-4 bg-gradient-to-r from-[#14B8A6]/10 to-amber-50 rounded-xl border border-[#14B8A6]/20">
            <p className="text-gray-600 mb-3" style={{ fontSize: '0.8rem' }}>{texts.upgradeDesc}</p>
            <button
              onClick={handleUpgrade}
              disabled={upgradeLoading}
              className="w-full bg-[#14B8A6] text-white py-3 rounded-xl hover:bg-[#0D9488] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ fontSize: '0.875rem', fontWeight: 600 }}
            >
              <Crown size={16} />
              {upgradeLoading ? '...' : texts.upgrade}
            </button>
          </div>
        ) : (
          <button
            onClick={handleManageSub}
            className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            style={{ fontSize: '0.875rem', fontWeight: 500 }}
          >
            {texts.manageSub}
          </button>
        )}

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 text-red-500 py-3 rounded-xl hover:bg-red-50 transition-colors"
          style={{ fontSize: '0.875rem', fontWeight: 500 }}
        >
          <LogOut size={16} />
          {texts.signOut}
        </button>
      </div>
    </div>
  );
}
