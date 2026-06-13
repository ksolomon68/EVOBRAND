import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';

const HeroAnimation = ({ scrollContainerRef }) => {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const startFrame = 38;
  const endFrame = 76;
  const frameCount = endFrame - startFrame + 1;

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const imgArray = [];

    const loadImages = async () => {
      const promises = [];
      for (let i = startFrame; i <= endFrame; i++) {
        const img = new Image();
        // padStart(3, '0') makes 1 into 001, 12 into 012, etc.
        const paddedIndex = i.toString().padStart(3, '0');
        img.src = `/header/ezgif-frame-${paddedIndex}.jpg`;
        
        const promise = new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
        promises.push(promise);
        imgArray.push(img);
      }
      
      await Promise.all(promises);
      setImages(imgArray);
      setIsLoading(false);
    };

    loadImages();
  }, []);

  // Scroll progress for the entire page or just the hero section?
  // The requirement says "0% scroll = first frame, 100% scroll of hero section = last frame".
  // So we track scroll relative to the container.
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "center start"] // Animate while the container is in view (from start of container at top of viewport to end of container at top of viewport)
  });

  // Create a smooth spring for the index to avoid jumpiness
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Mapping scroll progress (0-1) to image index (0 - frameCount-1)
  // We use a state or ref to store current index to avoid re-renders if possible, 
  // but for canvas drawing we need to trigger updates.
  // Actually, we can use useTransform to get the index.
  const currentIndex = useTransform(smoothProgress, [0, 1], [0, frameCount - 1]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas || images.length === 0) return;

      const ctx = canvas.getContext('2d');
      // Get the integer index
      let idx = prefersReducedMotion ? 0 : Math.round(currentIndex.get());
      if (idx < 0) idx = 0;
      if (idx >= frameCount) idx = frameCount - 1;

      const img = images[idx];
      if (!img) return;

      // Object-fit: cover logic
      const w = canvas.width;
      const h = canvas.height;
      const imgW = img.width;
      const imgH = img.height;

      const scale = Math.max(w / imgW, h / imgH);
      const x = (w - imgW * scale) / 2;
      const y = (h - imgH * scale) / 2;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, x, y, imgW * scale, imgH * scale);

      requestAnimationFrame(render);
    };

    const animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [images, currentIndex]); // Re-run when images are loaded

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-[#0f1419]">
      <canvas
        ref={canvasRef}
        className="w-full h-full block object-cover relative z-0"
        aria-hidden="true"
      />

      {/* Fallback/First Frame Image - visible until canvas starts rendering */}
      {isLoading && (
        <img
          src="/header/ezgif-frame-038.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover z-[-1]"
        />
      )}

      {/* Loading Indicator (Subtle) */}
      {isLoading && (
        <div className="absolute bottom-10 right-10 z-10" aria-hidden="true">
          <div className="w-6 h-6 border-2 border-[#22c8e5] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f1419]/90 via-[#0f1419]/40 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-transparent to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default HeroAnimation;
