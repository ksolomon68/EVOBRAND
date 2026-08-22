import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Play, Info } from 'lucide-react';

export default function VideoHero({ video, onPlay }) {
  const rootRef = useRef(null);

  useGSAP(() => {
    if (!rootRef.current) return;
    gsap.fromTo(
      rootRef.current.querySelectorAll('.vh-reveal'),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out' }
    );
  }, { dependencies: [video?.id] });

  if (!video) return null;

  return (
    <div
      ref={rootRef}
      className="relative w-full rounded-2xl overflow-hidden mb-16 border border-white/5"
      style={{ aspectRatio: '21/9', minHeight: 320 }}
    >
      {/* Backdrop */}
      <img
        src={video.thumbnail}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />

      {/* Cinematic gradient scrim */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(6,10,14,0.97) 0%, rgba(6,10,14,0.78) 38%, rgba(6,10,14,0.25) 65%, rgba(6,10,14,0.1) 100%), linear-gradient(0deg, rgba(6,10,14,0.95) 0%, rgba(6,10,14,0.1) 45%, rgba(6,10,14,0.35) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 pb-8 md:pb-12 max-w-2xl">
        <div className="vh-reveal flex items-center gap-2 mb-4">
          <span
            className="px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-widest"
            style={{ background: '#22c8e5', color: '#003258' }}
          >
            New Release
          </span>
          <span className="text-gray-400 text-xs uppercase tracking-widest">Video Library</span>
        </div>

        <h3 className="vh-reveal text-2xl md:text-4xl font-bold text-white leading-tight mb-3 line-clamp-2">
          {video.title}
        </h3>

        {video.description && (
          <p className="vh-reveal text-gray-300 text-sm md:text-base line-clamp-2 mb-6 max-w-xl">
            {video.description}
          </p>
        )}

        <div className="vh-reveal flex items-center gap-3">
          <button
            onClick={() => onPlay(video.id)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5]"
            style={{ background: '#22c8e5', color: '#003258' }}
          >
            <Play size={18} fill="#003258" />
            Play
          </button>
          <button
            onClick={() => onPlay(video.id)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm bg-white/10 text-white border border-white/15 backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5]"
          >
            <Info size={18} />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
}
