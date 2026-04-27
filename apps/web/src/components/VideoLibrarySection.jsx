import React, { useState, useMemo, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Loader2, AlertCircle } from 'lucide-react';
import useYouTubePlaylist from '@/hooks/useYouTubePlaylist.js';
import VideoSlider from '@/components/VideoSlider.jsx';
import VideoModal from '@/components/VideoModal.jsx';

const CATEGORIES = ['All', 'Branding', 'Automation', 'AI Solutions', 'Business Growth'];

const KEYWORDS = {
  Branding: ['brand', 'identity', 'logo', 'design', 'visual', 'creative', 'art'],
  Automation: ['automation', 'workflow', 'bot', 'process', 'system', 'efficient', 'auto'],
  'AI Solutions': ['ai', 'intelligence', 'gpt', 'llm', 'model', 'machine learning', 'tech', 'chatgpt'],
  'Business Growth': ['growth', 'scale', 'marketing', 'sales', 'strategy', 'revenue', 'business', 'profit'],
};

export default function VideoLibrarySection() {
  const { videos, loading, error } = useYouTubePlaylist('PLE-KllGUkEz7CBo120L5G3NWoYKHNkWuo');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const pillsRef = useRef(null);
  const headingRef = useRef(null);

  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'All') return videos;
    const kw = KEYWORDS[selectedCategory] ?? [];
    return videos.filter((v) => {
      const text = `${v.title} ${v.description}`.toLowerCase();
      return kw.some((k) => text.includes(k));
    });
  }, [videos, selectedCategory]);

  // Section entrance
  useGSAP(() => {
    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: headingRef.current, start: 'top 85%' } }
      );
    }
    if (pillsRef.current) {
      gsap.fromTo(
        pillsRef.current.children,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', scrollTrigger: { trigger: pillsRef.current, start: 'top 90%' } }
      );
    }
  }, []);

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0f1419 0%, #0f1419 100%)' }}
      aria-labelledby="video-library-heading"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: '#22c8e5' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-6" style={{ background: '#22c8e5' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: '#22c8e5' }}>
            Our Animated Series
          </p>
          <h2
            id="video-library-heading"
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Video Library
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Explore our library of AI transformations, tutorials, and client success stories.
          </p>
          <div className="w-12 h-0.5 mx-auto mt-5" style={{ background: '#22c8e5' }} />
        </div>

        {/* Category filters */}
        <div
          ref={pillsRef}
          className="flex flex-wrap justify-center gap-3 mb-12"
          role="group"
          aria-label="Filter videos by category"
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={active}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5] ${
                  active
                    ? 'text-[#003258] border-transparent scale-105'
                    : 'bg-transparent text-gray-400 border-white/10 hover:border-[#22c8e5]/50 hover:text-[#22c8e5]'
                }`}
                style={active ? { background: '#22c8e5' } : {}}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: '#22c8e5' }} aria-hidden="true" />
            <p className="text-gray-400 text-sm tracking-widest uppercase">Loading library...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center" role="alert">
            <AlertCircle className="w-10 h-10 text-red-400 mb-4" aria-hidden="true" />
            <p className="text-white text-lg mb-1">Unable to load videos</p>
            <p className="text-gray-500 max-w-sm text-sm">{error}</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-400 text-lg">No videos in this category yet.</p>
          </div>
        ) : (
          <VideoSlider videos={filteredVideos} onVideoSelect={setSelectedVideoId} />
        )}
      </div>

      {selectedVideoId && (
        <VideoModal videoId={selectedVideoId} onClose={() => setSelectedVideoId(null)} />
      )}
    </section>
  );
}
