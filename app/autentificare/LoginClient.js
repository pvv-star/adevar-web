'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginClient() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    router.push('/');
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
          Bine ati venit! Conectati-va la contul dvs.
        </p>
      </div>

      <div className="px-6 space-y-3 mb-6">
        <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 bg-white hover:bg-gray-50 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-gray-700" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Continua cu Google</span>
        </button>
        <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 bg-white hover:bg-gray-50 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <span className="text-gray-700" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Continua cu Apple</span>
        </button>
      </div>

      <div className="flex items-center gap-3 px-6 mb-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-gray-400" style={{ fontSize: '0.75rem' }}>sau</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleLogin} className="px-6 space-y-4 flex-1">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="email"
            placeholder="Adresa de email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:border-[#14B8A6] transition-colors"
            style={{ fontSize: '0.875rem' }}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Parola"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          className="w-full bg-[#14B8A6] text-white py-3.5 rounded-xl hover:bg-[#0D9488] transition-colors"
          style={{ fontSize: '0.875rem', fontWeight: 600 }}
        >
          Autentificare cu parola
        </button>
      </form>

      <div className="flex items-center justify-center gap-1 pb-10 pt-6">
        <span className="text-gray-400" style={{ fontSize: '0.8rem' }}>Nu aveti cont?</span>
        <button className="text-[#14B8A6]" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Inregistrare</button>
      </div>
    </div>
  );
}
