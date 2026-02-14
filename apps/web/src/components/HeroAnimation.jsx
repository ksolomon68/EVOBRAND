import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';

const HeroAnimation = ({ scrollContainerRef }) => {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Total number of frames
  const frameCount = 121;

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const imgArray = [];

    const loadImages = async () => {
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        // Construct filename: _MConverter.eu_envato_video_gen_Feb_06_2026_6_14_36-X.png
        // Note: The file naming seems to be index-based.
        // Based on the file list, the pattern is consistent.
        // We need to handle the path correctly relative to public/
        img.src = `/header/_MConverter.eu_envato_video_gen_Feb_06_2026_6_14_36-${i}.png`;

        await new Promise((resolve) => {
          img.onload = () => {
            loadedCount++;
            if (loadedCount === frameCount) {
              setIsLoading(false);
            }
            resolve();
          };
          // If a single image fails, we still want to continue, maybe log it
          img.onerror = resolve;
        });
        imgArray.push(img);
      }
      setImages(imgArray);
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
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas || images.length === 0) return;

      const ctx = canvas.getContext('2d');
      // Get the integer index
      let idx = Math.round(currentIndex.get());
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
        className="w-full h-full block object-cover"
      />
      {/* Optional Loading State or Fallback */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f1419] z-20">
          {/* Simple loading spinner or just background */}
        </div>
      )}
      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f1419]/90 via-[#0f1419]/40 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-transparent to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default HeroAnimation;
