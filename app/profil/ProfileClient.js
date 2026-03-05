'use client';
import { useState } from 'react';
import { Settings, Grid3X3, Bookmark, Heart } from 'lucide-react';
import { IMAGES, articles } from '@/lib/figma-data';
import Link from 'next/link';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export default function ProfileClient() {
  const [activeTab, setActiveTab] = useState('posts');

  const tabs = [
    { id: 'posts', icon: Grid3X3 },
    { id: 'saved', icon: Bookmark },
    { id: 'liked', icon: Heart },
  ];

  return (
    <div className="flex flex-col h-dvh bg-white overflow-y-auto pb-20">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Profil</h2>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Settings size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="flex flex-col items-center px-5 pt-2 pb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3 ring-2 ring-[#14B8A6] ring-offset-2">
          <ImageWithFallback
            src={IMAGES.avatarWoman}
            alt="Profil"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Maria Ionescu</h3>
        <p className="text-gray-400" style={{ fontSize: '0.75rem' }}>@maria.ionescu</p>

        <div className="flex items-center gap-8 mt-4">
          <div className="flex flex-col items-center">
            <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>1.234</span>
            <span className="text-gray-400" style={{ fontSize: '0.7rem' }}>Postari</span>
          </div>
          <div className="flex flex-col items-center">
            <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>123</span>
            <span className="text-gray-400" style={{ fontSize: '0.7rem' }}>Urmariti</span>
          </div>
          <div className="flex flex-col items-center">
            <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>5,6K</span>
            <span className="text-gray-400" style={{ fontSize: '0.7rem' }}>Urmaritori</span>
          </div>
        </div>

        <p className="text-center text-gray-500 mt-3 max-w-[260px]" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
          Pasionata de tehnologie si date deschise, imi place sa descopar si sa impartasesc povesti captivante despre lumea digitala.
        </p>
        <p className="text-[#14B8A6] mt-1" style={{ fontSize: '0.75rem' }}>www.adevar.ai/maria</p>

        <div className="flex gap-3 mt-4 w-full">
          <button className="flex-1 bg-[#14B8A6] text-white py-2.5 rounded-xl hover:bg-[#0D9488] transition-colors" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Editeaza profilul
          </button>
          <button className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Distribuie profilul
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center py-3 transition-colors ${
              activeTab === tab.id
                ? 'text-[#14B8A6] border-b-2 border-[#14B8A6]'
                : 'text-gray-400'
            }`}
          >
            <tab.icon size={20} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-0.5 p-0.5">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.id}`}
            className="aspect-square relative overflow-hidden"
          >
            <ImageWithFallback
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
