'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Send } from 'lucide-react';
import { articles, comments as mockComments } from '@/lib/figma-data';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export default function ArticleClient() {
  const { id } = useParams();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState(mockComments);

  const article = articles.find((a) => a.id === id) || articles[0];

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setCommentsList([
      {
        id: String(commentsList.length + 1),
        user: 'Tu',
        avatar: '',
        text: newComment,
        timeAgo: 'Chiar acum',
        likes: 0,
      },
      ...commentsList,
    ]);
    setNewComment('');
  };

  if (showComments) {
    return (
      <div className="flex flex-col h-dvh bg-white">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
          <button onClick={() => setShowComments(false)} className="p-1">
            <ArrowLeft size={20} className="text-gray-800" />
          </button>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
            Comentarii ({article.comments.toLocaleString()})
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {commentsList.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {comment.avatar ? (
                  <ImageWithFallback
                    src={comment.avatar}
                    alt={comment.user}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#14B8A6] flex items-center justify-center text-white" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {comment.user[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-900" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {comment.user}
                  </span>
                  <span className="text-gray-400" style={{ fontSize: '0.65rem' }}>
                    {comment.timeAgo}
                  </span>
                </div>
                <p className="text-gray-600 mt-1" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  {comment.text}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <button className="flex items-center gap-1 text-gray-400">
                    <Heart size={14} />
                    <span style={{ fontSize: '0.7rem' }}>{comment.likes}</span>
                  </button>
                  <button className="text-gray-400" style={{ fontSize: '0.7rem' }}>Raspunde</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3">
          <input
            type="text"
            placeholder="Adauga un comentariu..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#14B8A6]"
            style={{ fontSize: '0.8rem' }}
          />
          <button
            onClick={handleAddComment}
            className="p-2.5 bg-[#14B8A6] text-white rounded-full"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-white">
      <div className="relative">
        <ImageWithFallback
          src={article.image}
          alt={article.title}
          className="w-full h-56 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/90 rounded-full backdrop-blur-sm"
        >
          <ArrowLeft size={18} className="text-gray-800" />
        </button>
        <button
          onClick={() => setSaved(!saved)}
          className="absolute top-4 right-4 p-2 bg-white/90 rounded-full backdrop-blur-sm"
        >
          <Bookmark size={18} className={saved ? 'text-[#14B8A6] fill-[#14B8A6]' : 'text-gray-800'} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#14B8A6] px-2 py-0.5 bg-teal-50 rounded" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
            {article.category}
          </span>
          <span className="text-gray-400" style={{ fontSize: '0.65rem' }}>{article.timeAgo}</span>
        </div>

        <h1 className="text-gray-900 mb-3" style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 }}>
          {article.title}
        </h1>

        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#FFC107]" />
          <div>
            <p className="text-gray-900" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{article.source}</p>
            <p className="text-gray-400" style={{ fontSize: '0.65rem' }}>Publicat {article.timeAgo}</p>
          </div>
        </div>

        <p className="text-gray-600 mb-4" style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>
          {article.content}
        </p>
        <p className="text-gray-600 mb-4" style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>
          Expertii din industrie au laudat initiativa, observand ca aceasta reprezinta un pas semnificativ inainte in abordarea unora dintre cele mai presante provocari cu care se confrunta societatea astazi.
        </p>
        <p className="text-gray-600" style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>
          Pe masura ce povestea continua sa se dezvolte, analistii prezic implicatii de mare anvergura atat pentru consumatori, cat si pentru afaceri. Ramaneti la curent pentru mai multe actualizari.
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-1.5"
          >
            <Heart
              size={20}
              className={liked ? 'text-red-500 fill-red-500' : 'text-gray-400'}
            />
            <span className="text-gray-500" style={{ fontSize: '0.75rem' }}>
              {(article.likes + (liked ? 1 : 0)).toLocaleString()}
            </span>
          </button>
          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5"
          >
            <MessageCircle size={20} className="text-gray-400" />
            <span className="text-gray-500" style={{ fontSize: '0.75rem' }}>
              {article.comments.toLocaleString()}
            </span>
          </button>
        </div>
        <button className="p-2">
          <Share2 size={20} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}
