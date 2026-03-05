'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';

const UI_TEXT = {
  ro: {
    welcome: 'Bine ați venit! Conectați-vă la contul dvs.',
    signupWelcome: 'Creați un cont nou pe adevar.ai',
    email: 'Adresa de email',
    password: 'Parola',
    name: 'Numele dvs.',
    login: 'Autentificare',
    signup: 'Creează cont',
    noAccount: 'Nu aveți cont?',
    hasAccount: 'Aveți deja cont?',
    switchToSignup: 'Înregistrare',
    switchToLogin: 'Autentificare',
    or: 'sau',
    invalidEmail: 'Adresă de email invalidă',
    weakPassword: 'Parola trebuie să aibă cel puțin 6 caractere',
    invalidCredentials: 'Email sau parolă incorectă',
    emailTaken: 'Acest email este deja înregistrat',
    checkEmail: 'Verificați emailul pentru confirmarea contului',
    genericError: 'A apărut o eroare. Încercați din nou.',
  },
  en: {
    welcome: 'Welcome! Sign in to your account.',
    signupWelcome: 'Create a new account on adevar.ai',
    email: 'Email address',
    password: 'Password',
    name: 'Your name',
    login: 'Sign in',
    signup: 'Create account',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    switchToSignup: 'Sign up',
    switchToLogin: 'Sign in',
    or: 'or',
    invalidEmail: 'Invalid email address',
    weakPassword: 'Password must be at least 6 characters',
    invalidCredentials: 'Incorrect email or password',
    emailTaken: 'This email is already registered',
    checkEmail: 'Check your email to confirm your account',
    genericError: 'Something went wrong. Please try again.',
  },
  ru: {
    welcome: 'Добро пожаловать! Войдите в свой аккаунт.',
    signupWelcome: 'Создайте новый аккаунт на adevar.ai',
    email: 'Адрес электронной почты',
    password: 'Пароль',
    name: 'Ваше имя',
    login: 'Войти',
    signup: 'Создать аккаунт',
    noAccount: 'Нет аккаунта?',
    hasAccount: 'Уже есть аккаунт?',
    switchToSignup: 'Регистрация',
    switchToLogin: 'Войти',
    or: 'или',
    invalidEmail: 'Неверный адрес электронной почты',
    weakPassword: 'Пароль должен содержать не менее 6 символов',
    invalidCredentials: 'Неверный email или пароль',
    emailTaken: 'Этот email уже зарегистрирован',
    checkEmail: 'Проверьте email для подтверждения аккаунта',
    genericError: 'Произошла ошибка. Попробуйте снова.',
  },
};

function getErrorMessage(error, texts) {
  const msg = error?.message?.toLowerCase() || '';
  if (msg.includes('invalid login') || msg.includes('invalid_credentials')) return texts.invalidCredentials;
  if (msg.includes('already registered') || msg.includes('already been registered')) return texts.emailTaken;
  if (msg.includes('password') && msg.includes('6')) return texts.weakPassword;
  if (msg.includes('email')) return texts.invalidEmail;
  return texts.genericError;
}

export default function LoginClient() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const { lang } = useLang();
  const texts = UI_TEXT[lang] || UI_TEXT.ro;

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password, displayName);
        setSuccess(texts.checkEmail);
      } else {
        await signIn(email, password);
        router.push('/');
      }
    } catch (err) {
      setError(getErrorMessage(err, texts));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-white">
      <div className="flex flex-col items-center pt-12 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <path d="M8 6C8 6 16 6 20 20C24 6 32 6 32 6V34C32 34 24 34 20 20C16 34 8 34 8 34V6Z" fill="url(#gradLogin)" />
            <defs>
              <linearGradient id="gradLogin" x1="8" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
                <stop stopColor="#14B8A6" />
                <stop offset="1" stopColor="#FFC107" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-[#0F766E]" style={{ fontSize: '1.125rem', fontWeight: 700 }}>adevar.ai</span>
        </div>
        <p className="text-gray-400 text-center" style={{ fontSize: '0.8rem' }}>
          {mode === 'login' ? texts.welcome : texts.signupWelcome}
        </p>
      </div>

      {error && (
        <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600" style={{ fontSize: '0.8rem' }}>{error}</p>
        </div>
      )}

      {success && (
        <div className="mx-6 mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-600" style={{ fontSize: '0.8rem' }}>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-6 space-y-4 flex-1">
        {mode === 'signup' && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={texts.name}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:border-[#14B8A6] transition-colors"
              style={{ fontSize: '0.875rem' }}
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="email"
            placeholder={texts.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:border-[#14B8A6] transition-colors"
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder={texts.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full pl-12 pr-12 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:border-[#14B8A6] transition-colors"
            style={{ fontSize: '0.875rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#14B8A6] text-white py-3.5 rounded-xl hover:bg-[#0D9488] transition-colors disabled:opacity-50"
          style={{ fontSize: '0.875rem', fontWeight: 600 }}
        >
          {loading ? '...' : mode === 'login' ? texts.login : texts.signup}
        </button>
      </form>

      <div className="flex items-center justify-center gap-1 pb-10 pt-6">
        <span className="text-gray-400" style={{ fontSize: '0.8rem' }}>
          {mode === 'login' ? texts.noAccount : texts.hasAccount}
        </span>
        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
          className="text-[#14B8A6]"
          style={{ fontSize: '0.8rem', fontWeight: 600 }}
        >
          {mode === 'login' ? texts.switchToSignup : texts.switchToLogin}
        </button>
      </div>
    </div>
  );
}
