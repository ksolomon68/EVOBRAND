
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import useYouTubePlaylist from '@/hooks/useYouTubePlaylist.js';
import VideoCard from '@/components/VideoCard.jsx';
import VideoModal from '@/components/VideoModal.jsx';

const VideoLibrarySection = () => {
  const { videos, loading, error } = useYouTubePlaylist('PLE-KllGUkEz7CBo120L5G3NWoYKHNkWuo');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  const categories = ['All', 'Branding', 'Automation', 'AI Solutions', 'Business Growth'];

  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'All') return videos;

    const keywords = {
      'Branding': ['brand', 'identity', 'logo', 'design', 'visual', 'creative', 'art'],
      'Automation': ['automation', 'workflow', 'bot', 'process', 'system', 'efficient', 'auto'],
      'AI Solutions': ['ai', 'intelligence', 'gpt', 'llm', 'model', 'machine learning', 'tech', 'chatgpt'],
      'Business Growth': ['growth', 'scale', 'marketing', 'sales', 'strategy', 'revenue', 'business', 'profit']
    };

    const categoryKeywords = keywords[selectedCategory] || [];

    return videos.filter(video => {
      const text = (video.title + ' ' + video.description).toLowerCase();
      return categoryKeywords.some(keyword => text.includes(keyword));
    });
  }, [videos, selectedCategory]);

  return (
    <section className="py-16 bg-[#0f1419] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#22c8e5]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#5668ff]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Animated Series</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore our library of AI transformations, tutorials, and success stories.
          </p>
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category
                  ? 'bg-[#22c8e5] text-white shadow-lg shadow-[#22c8e5]/25 scale-105'
                  : 'bg-[#1a2332] text-gray-400 hover:bg-[#2a3b55] hover:text-white border border-white/5'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#22c8e5] animate-spin mb-4" />
            <p className="text-gray-400">Loading video library...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-white text-lg mb-2">Unable to load videos</p>
            <p className="text-gray-500 max-w-md">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredVideos.length > 0 ? (
                filteredVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <VideoCard video={video} onClick={setSelectedVideoId} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-20"
                >
                  <p className="text-gray-400 text-lg">No videos found in this category.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideoId && (
        <VideoModal
          videoId={selectedVideoId}
          onClose={() => setSelectedVideoId(null)}
        />
      )}
    </section>
  );
};

export default VideoLibrarySection;
