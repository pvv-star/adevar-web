'use client';
import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { articles, categories } from '@/lib/figma-data';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export default function DiscoverClient() {
  const [search, setSearch] = useState('');

  const filtered = search
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.category.toLowerCase().includes(search.toLowerCase())
      )
    : articles;

  return (
    <div className="flex flex-col h-dvh bg-white overflow-y-auto pb-20">
      <div className="px-5 pt-4 pb-3">
        <h2 className="mb-3" style={{ fontSize: '1.125rem', fontWeight: 700 }}>Descopera</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cauta stiri, subiecte..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#14B8A6]"
            style={{ fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div className="px-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-[#14B8A6]" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Subiecte populare</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.slice(1).map((cat) => (
            <button
              key={cat}
              onClick={() => setSearch(cat)}
              className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-[#14B8A6] hover:text-white transition-colors"
              style={{ fontSize: '0.75rem', fontWeight: 500 }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        <h3 className="mb-3" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          {search ? 'Rezultate cautare' : 'Pentru tine'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.id}`}
              className="text-left rounded-2xl overflow-hidden bg-gray-50"
            >
              <ImageWithFallback
                src={article.image}
                alt={article.title}
                className="w-full h-24 object-cover"
              />
              <div className="p-2.5">
                <span className="text-[#14B8A6]" style={{ fontSize: '0.6rem', fontWeight: 600 }}>
                  {article.category}
                </span>
                <p className="text-gray-900 mt-0.5 line-clamp-2" style={{ fontSize: '0.7rem', fontWeight: 600, lineHeight: 1.4 }}>
                  {article.title}
                </p>
                <p className="text-gray-400 mt-1" style={{ fontSize: '0.6rem' }}>{article.timeAgo}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
