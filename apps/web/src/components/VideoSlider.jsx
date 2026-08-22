import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

const CARD_W = 300;
const CARD_GAP = 16;
const PEEK = 40;

export default function VideoSlider({ videos = [], onVideoSelect, title, newVideoIds }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const dragging = useRef(false);
  const dragStart = useRef(0);
  const posAtDrag = useRef(0);
  const hasDragged = useRef(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const maxOffset = useCallback(() => {
    if (!containerRef.current) return 0;
    const total = videos.length * (CARD_W + CARD_GAP) - CARD_GAP;
    const visible = containerRef.current.offsetWidth - PEEK * 2;
    return Math.max(0, total - visible);
  }, [videos.length]);

  const clamp = useCallback((v) => Math.max(-maxOffset(), Math.min(0, v)), [maxOffset]);

  const updateArrows = useCallback(() => {
    setCanPrev(posRef.current < 0);
    setCanNext(posRef.current > -maxOffset());
  }, [maxOffset]);

  const snapToIndex = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(videos.length - 1, idx));
    const raw = -(clamped * (CARD_W + CARD_GAP));
    const next = clamp(raw);
    posRef.current = next;
    gsap.to(trackRef.current, { x: next, duration: 0.55, ease: 'power3.out' });
    setActiveIndex(clamped);
    updateArrows();
  }, [videos.length, clamp, updateArrows]);

  const slide = useCallback((dir) => {
    const step = Math.max(1, Math.floor((containerRef.current?.offsetWidth ?? 900) / (CARD_W + CARD_GAP)));
    snapToIndex(activeIndex + dir * step);
  }, [activeIndex, snapToIndex]);

  // Initial stagger reveal
  useGSAP(() => {
    if (!trackRef.current || videos.length === 0) return;
    const cards = trackRef.current.querySelectorAll('.vs-card');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 24, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.07, ease: 'power2.out', clearProps: 'scale' }
    );
    updateArrows();
  }, { dependencies: [videos] });

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') slide(-1);
      if (e.key === 'ArrowRight') slide(1);
    };
    const el = containerRef.current;
    el?.addEventListener('keydown', onKey);
    return () => el?.removeEventListener('keydown', onKey);
  }, [slide]);

  // Drag
  const onPointerDown = useCallback((e) => {
    dragging.current = true;
    hasDragged.current = false;
    dragStart.current = e.clientX;
    posAtDrag.current = posRef.current;
    gsap.killTweensOf(trackRef.current);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const delta = e.clientX - dragStart.current;
    if (Math.abs(delta) > 5) hasDragged.current = true;
    const next = clamp(posAtDrag.current + delta);
    posRef.current = next;
    gsap.set(trackRef.current, { x: next });
  }, [clamp]);

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    // Snap to nearest card
    const nearest = Math.round(-posRef.current / (CARD_W + CARD_GAP));
    snapToIndex(nearest);
  }, [snapToIndex]);

  // Card hover
  const onCardEnter = useCallback((e) => {
    const card = e.currentTarget;
    gsap.to(card, { y: -10, scale: 1.04, duration: 0.35, ease: 'power2.out' });
    const overlay = card.querySelector('.vs-overlay');
    const title = card.querySelector('.vs-title');
    if (overlay) gsap.to(overlay, { opacity: 1, duration: 0.3 });
    if (title) gsap.to(title, { y: 0, opacity: 1, duration: 0.3 });
  }, []);

  const onCardLeave = useCallback((e) => {
    const card = e.currentTarget;
    gsap.to(card, { y: 0, scale: 1, duration: 0.35, ease: 'power2.out' });
    const overlay = card.querySelector('.vs-overlay');
    const title = card.querySelector('.vs-title');
    if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    if (title) gsap.to(title, { y: 8, opacity: 0, duration: 0.3 });
  }, []);

  const handleCardClick = useCallback((videoId) => {
    if (!hasDragged.current) onVideoSelect(videoId);
  }, [onVideoSelect]);

  if (videos.length === 0) return null;

  return (
    <div className="relative px-10">
      {title && (
        <h3 className="text-white text-xl md:text-2xl font-bold mb-4 px-0">{title}</h3>
      )}
      {/* Prev arrow */}
      <button
        onClick={() => slide(-1)}
        disabled={!canPrev}
        aria-label="Previous videos"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0A1628] border border-[#22c8e5]/30 flex items-center justify-center text-[#22c8e5] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#22c8e5] hover:text-[#003258] transition-all duration-200 shadow-lg shadow-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5] focus-visible:outline-offset-2"
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>

      {/* Next arrow */}
      <button
        onClick={() => slide(1)}
        disabled={!canNext}
        aria-label="Next videos"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0A1628] border border-[#22c8e5]/30 flex items-center justify-center text-[#22c8e5] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#22c8e5] hover:text-[#003258] transition-all duration-200 shadow-lg shadow-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5] focus-visible:outline-offset-2"
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>

      {/* Track */}
      <div
        ref={containerRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing select-none focus:outline-none"
        tabIndex={0}
        aria-label="Video library slider. Use arrow keys to navigate."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ gap: CARD_GAP, width: 'max-content', padding: `4px ${PEEK}px 16px` }}
        >
          {videos.map((video, i) => (
            <div
              key={video.id}
              className="vs-card relative rounded-xl overflow-hidden flex-shrink-0 bg-[#0A1628] border border-white/5 will-change-transform"
              style={{ width: CARD_W, aspectRatio: '16/9' }}
              onMouseEnter={onCardEnter}
              onMouseLeave={onCardLeave}
              onClick={() => handleCardClick(video.id)}
              onKeyDown={(e) => e.key === 'Enter' && onVideoSelect(video.id)}
              role="button"
              tabIndex={0}
              aria-label={`Play: ${video.title}`}
            >
              {/* Thumbnail */}
              <img
                src={video.thumbnail}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
                loading={i < 4 ? 'eager' : 'lazy'}
              />

              {/* Persistent dark gradient at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 via-transparent to-transparent pointer-events-none" aria-hidden="true" />

              {/* New badge */}
              {newVideoIds?.has(video.id) && (
                <span
                  className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest pointer-events-none"
                  style={{ background: '#22c8e5', color: '#003258' }}
                >
                  New
                </span>
              )}

              {/* Hover overlay */}
              <div className="vs-overlay absolute inset-0 bg-[#0A1628]/70 opacity-0 flex flex-col items-center justify-center px-4 pointer-events-none" aria-hidden="true">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #22c8e5, #1ba3c0)' }}
                >
                  <Play size={22} fill="#003258" className="text-[#003258] ml-1" />
                </div>
                <div className="w-8 h-px bg-[#22c8e5] mb-2" />
                {video.description && (
                  <p className="text-gray-300 text-[11px] text-center leading-snug line-clamp-2">
                    {video.description}
                  </p>
                )}
              </div>

              {/* Title — always shown, animates on hover */}
              <p className="vs-title absolute bottom-3 left-3 right-3 text-white text-xs font-semibold leading-tight line-clamp-2 opacity-0 translate-y-2 pointer-events-none" aria-hidden="true">
                {video.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-4" role="group" aria-label="Video slider position">
        {videos.map((_, i) => (
          <button
            key={i}
            aria-pressed={i === activeIndex}
            aria-label={`Go to video ${i + 1}`}
            onClick={() => snapToIndex(i)}
            className={`h-1 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5] ${
              i === activeIndex ? 'w-6 bg-[#22c8e5]' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
