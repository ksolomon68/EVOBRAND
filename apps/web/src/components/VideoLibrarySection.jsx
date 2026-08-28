import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Loader2 } from 'lucide-react';
import useYouTubePlaylist from '@/hooks/useYouTubePlaylist.js';
import VideoSlider from '@/components/VideoSlider.jsx';
import VideoModal from '@/components/VideoModal.jsx';
import VideoHero from '@/components/VideoHero.jsx';

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = ['All', 'Branding', 'Automation', 'AI Solutions', 'Business Growth'];

// Ordered by priority: a video is assigned to the first category it matches,
// so each video lives in exactly one row instead of repeating across several.
const KEYWORDS = {
  Branding: ['brand', 'branding', 'branded', 'identity', 'logo', 'design', 'visual', 'creative', 'creativity'],
  Automation: ['automation', 'automate', 'automating', 'workflow', 'process', 'system', 'systems', 'efficient', 'efficiency', 'paperwork'],
  'AI Solutions': ['ai', 'artificial intelligence', 'intelligence', 'gpt', 'llm', 'chatgpt', 'machine learning', 'technology'],
  'Business Growth': ['growth', 'growing', 'scale', 'scaling', 'scalable', 'marketing', 'sales', 'strategy', 'revenue', 'business', 'profit'],
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const matchesKeyword = (text, keyword) => new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'i').test(text);

const categorize = (video) => {
  const text = `${video.title} ${video.description}`;
  for (const cat of CATEGORIES) {
    if (cat === 'All') continue;
    if (KEYWORDS[cat].some((k) => matchesKeyword(text, k))) return cat;
  }
  return null;
};

const ROW_LIMIT = 10;

export default function VideoLibrarySection() {
  const { videos, loading, error } = useYouTubePlaylist('PLE-KllGUkEz7CBo120L5G3NWoYKHNkWuo');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const pillsRef = useRef(null);
  const headingRef = useRef(null);
  const canvasRef = useRef(null);

  const sortedVideos = useMemo(
    () => videos.slice().sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    [videos]
  );

  const latestVideo = sortedVideos[0] ?? null;

  const newVideoIds = useMemo(() => {
    if (!latestVideo) return new Set();
    const threshold = new Date(latestVideo.publishedAt).getTime() - 1000 * 60 * 60 * 24 * 21; // 21-day window
    return new Set(sortedVideos.filter((v) => new Date(v.publishedAt).getTime() >= threshold).map((v) => v.id));
  }, [sortedVideos, latestVideo]);

  // Each video is assigned to exactly one category, so it never repeats across rows.
  const categorizedVideos = useMemo(
    () => sortedVideos.map((v) => ({ ...v, category: categorize(v) })),
    [sortedVideos]
  );

  const filterByCategory = useCallback(
    (cat) => categorizedVideos.filter((v) => v.category === cat),
    [categorizedVideos]
  );

  const categoryRows = useMemo(
    () =>
      CATEGORIES.filter((c) => c !== 'All')
        .map((cat) => ({ cat, videos: filterByCategory(cat).slice(0, ROW_LIMIT) }))
        .filter((row) => row.videos.length > 0),
    [filterByCategory]
  );

  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'All') return sortedVideos;
    return filterByCategory(selectedCategory);
  }, [sortedVideos, selectedCategory, filterByCategory]);

      // Canvas animated background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles = [];
    const particleCount = Math.min(50, Math.floor((width * height) / 25000));

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.radius = Math.random() * 1.8 + 1;
        this.alpha = Math.random() * 0.2 + 0.05; // Reduced opacity
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 200, 229, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34, 200, 229, ${0.05 * (1 - dist / 110)})`; // Reduced connection opacity
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
      style={{ background: 'linear-gradient(180deg, rgba(7,10,14,0.82) 0%, rgba(15,20,25,0.82) 100%)' }}
      aria-labelledby="video-library-heading"
    >
      {/* Animated Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50" aria-hidden="true" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-5" style={{ background: '#22c8e5' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-0" style={{ background: '#22c8e5' }} />
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
          <p className="text-gray-300 max-w-xl mx-auto">
            Fresh drops every week — AI transformations, tutorials, and client success stories.
          </p>
          <div className="w-12 h-0.5 mx-auto mt-5" style={{ background: '#22c8e5' }} />
        </div>

        {/* Category filters */}
        <div
          ref={pillsRef}
          className="flex flex-wrap justify-center gap-3 mb-12"
          role="tablist"
          aria-label="Filter videos by category"
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            const tabId = `video-tab-${cat.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <button
                key={cat}
                id={tabId}
                role="tab"
                onClick={() => setSelectedCategory(cat)}
                aria-selected={active}
                aria-controls="video-tabpanel"
                className={`px-5 py-2 rounded-2xl text-sm font-semibold transition-all duration-300 border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5] ${
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
        <div
          id="video-tabpanel"
          role="tabpanel"
          aria-labelledby={`video-tab-${selectedCategory.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: '#22c8e5' }} aria-hidden="true" />
              <p className="text-gray-400 text-sm tracking-widest uppercase">Loading library...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(34,200,229,0.08)', border: '1px solid rgba(34,200,229,0.15)' }}>
                <span className="text-4xl" aria-hidden="true">🎬</span>
              </div>
              <p className="text-white text-xl font-bold mb-2">Coming Soon</p>
              <p className="text-gray-300 max-w-sm text-sm">Our video library is on its way. Check back soon for AI tutorials and client stories.</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-gray-400 text-lg">No videos in this category yet.</p>
            </div>
          ) : selectedCategory === 'All' ? (
            <>
              {latestVideo && <VideoHero video={latestVideo} onPlay={setSelectedVideoId} />}
              <div className="space-y-14">
                <VideoSlider
                  videos={sortedVideos.slice(0, ROW_LIMIT)}
                  onVideoSelect={setSelectedVideoId}
                  newVideoIds={newVideoIds}
                  title="New Releases"
                />
                {categoryRows.map(({ cat, videos: rowVideos }) => (
                  <VideoSlider
                    key={cat}
                    videos={rowVideos}
                    onVideoSelect={setSelectedVideoId}
                    newVideoIds={newVideoIds}
                    title={cat}
                  />
                ))}
              </div>
            </>
          ) : (
            <VideoSlider
              videos={filteredVideos}
              onVideoSelect={setSelectedVideoId}
              newVideoIds={newVideoIds}
              title={selectedCategory}
            />
          )}
        </div>
      </div>

      {selectedVideoId && (
        <VideoModal videoId={selectedVideoId} onClose={() => setSelectedVideoId(null)} />
      )}
    </section>
  );
}
