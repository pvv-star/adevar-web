'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

const slides = [
  {
    title: 'Conectat mereu,\nOriunde, Oricand',
    description:
      'Bine ati venit pe adevar.ai — platforma dvs. pentru stiri de ultima ora, analize exclusive si continut personalizat.',
  },
  {
    title: 'Flux de stiri\npersonalizat',
    description:
      'Primiti stiri aliniate intereselor si preferintelor dvs. Calatoria dvs. personalizata prin stiri incepe aici!',
  },
  {
    title: 'Imbunatatiti-va\nexperienta informativa',
    description:
      'Faceti parte din comunitatea noastra dinamica si contribuiti cu perspectivele dvs! Participati la conversatii valoroase.',
  },
];

export default function OnboardingClient() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      router.push('/autentificare');
    }
  };

  const handleSkip = () => {
    router.push('/autentificare');
  };

  return (
    <div className="flex flex-col h-dvh bg-white relative overflow-hidden">
      <div className="flex items-center justify-center pt-12 pb-4">
        <div className="flex items-center gap-2">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M8 6C8 6 16 6 20 20C24 6 32 6 32 6V34C32 34 24 34 20 20C16 34 8 34 8 34V6Z" fill="url(#gradOnboard)" />
            <defs>
              <linearGradient id="gradOnboard" x1="8" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
                <stop stopColor="#14B8A6" />
                <stop offset="1" stopColor="#FFC107" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-[#0F766E]" style={{ fontSize: '1.25rem', fontWeight: 700 }}>adevar.ai</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col items-center"
          >
            <div className="relative w-48 h-48 mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-100 to-yellow-50" />
              <div className="absolute top-4 right-0 w-6 h-6 rounded-full bg-[#14B8A6]" />
              <div className="absolute top-12 -right-4 w-4 h-4 rounded-full bg-[#FFC107]" />
              <div className="absolute bottom-8 -left-2 w-3 h-3 rounded-full bg-[#14B8A6] opacity-60" />
              <div className="absolute inset-8 rounded-3xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
                <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
                  <path d="M8 6C8 6 16 6 20 20C24 6 32 6 32 6V34C32 34 24 34 20 20C16 34 8 34 8 34V6Z" fill="url(#gradOnboard2)" />
                  <defs>
                    <linearGradient id="gradOnboard2" x1="8" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#14B8A6" />
                      <stop offset="1" stopColor="#FFC107" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <h1 className="text-center text-gray-900 whitespace-pre-line mb-3" style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 }}>
              {slides[current].title}
            </h1>
            <p className="text-center text-gray-500 max-w-[280px]" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
              {slides[current].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-2 pb-6">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-6 h-2 bg-[#14B8A6]' : 'w-2 h-2 bg-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between px-8 pb-10">
        <button
          onClick={handleSkip}
          className="text-gray-400 px-4 py-2"
          style={{ fontSize: '0.875rem' }}
        >
          Omite
        </button>
        <button
          onClick={handleNext}
          className="bg-[#14B8A6] text-white px-8 py-3 rounded-full hover:bg-[#0D9488] transition-colors"
          style={{ fontSize: '0.875rem', fontWeight: 600 }}
        >
          Continua
        </button>
      </div>
    </div>
  );
}
