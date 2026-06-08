
import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const VideoCard = ({ video, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -5 }}
      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5]"
      onClick={() => onClick(video.id)}
      aria-label={`Play video: ${video.title}`}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt=""
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Overlay with Play Button */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
          <div className="w-16 h-16 bg-[#22c8e5]/90 rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75">
            <Play className="text-white ml-1" size={32} fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-white font-semibold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-[#22c8e5] transition-colors">
          {video.title}
        </h3>

        {/* Description - Hidden by default, shown on hover */}
        <div className="relative overflow-hidden h-0 group-hover:h-auto transition-all duration-300 ease-in-out">
           <p className="text-gray-400 text-sm line-clamp-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
             {video.description}
           </p>
        </div>
      </div>
    </motion.button>
  );
};

export default VideoCard;
