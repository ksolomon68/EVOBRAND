import { useState, useEffect } from 'react';
import axios from 'axios';

const CACHE_KEY_PREFIX = 'yt_playlist_cache_';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const FALLBACK_VIDEOS = [
  {
    id: 'UYzCXC2hh0I',
    title: 'Custom AI Agent Automation & Workflows',
    description: 'A comprehensive guide to building custom AI agents and workflow automation for modern business growth and operations.',
    thumbnail: 'https://img.youtube.com/vi/UYzCXC2hh0I/maxresdefault.jpg',
    publishedAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'pfwsofXBPeg',
    title: 'EVOBRAND Digital Transformation & Creative Architecture',
    description: 'Discover how EVOBRAND architects digital infrastructure and custom AI platforms to drive business branding and growth.',
    thumbnail: 'https://img.youtube.com/vi/pfwsofXBPeg/maxresdefault.jpg',
    publishedAt: '2025-11-15T10:00:00Z',
  },
  {
    id: 't7D-A0HnLhU',
    title: 'AI-Powered Document Generation & Brand Assets',
    description: 'How to automate brand asset creation, logo design, and contract builder setups using AI-powered systems.',
    thumbnail: 'https://img.youtube.com/vi/t7D-A0HnLhU/maxresdefault.jpg',
    publishedAt: '2025-08-22T14:30:00Z',
  },
  {
    id: 'l5j9mQ6yQpQ',
    title: 'Intelligent Database Systems and Automation',
    description: 'A tutorial on building robust relational schemas and automating API operations using node hooks.',
    thumbnail: 'https://img.youtube.com/vi/l5j9mQ6yQpQ/maxresdefault.jpg',
    publishedAt: '2025-06-05T09:15:00Z',
  },
];

const useYouTubePlaylist = (playlistId) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      const cacheKey = `${CACHE_KEY_PREFIX}${playlistId}`;

      if (!apiKey) {
        console.warn('VITE_YOUTUBE_API_KEY is missing in .env file. Using fallback videos.');
        setVideos(FALLBACK_VIDEOS);
        setLoading(false);
        return;
      }

      // Check cache first
      try {
        const cachedStr = sessionStorage.getItem(cacheKey);
        if (cachedStr) {
          const cachedData = JSON.parse(cachedStr);
          if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
            setVideos(cachedData.videos);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Ignore cache read errors
      }

      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
          params: {
            part: 'snippet,status',
            maxResults: 50,
            playlistId: playlistId,
            key: apiKey,
          },
        });

        const formattedVideos = response.data.items
          .filter(item => item.status.privacyStatus === 'public')
          .map((item) => ({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            publishedAt: item.snippet.publishedAt,
          }));

        // Save to cache
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            videos: formattedVideos
          }));
        } catch (e) {
          // Ignore cache write errors
        }

        setVideos(formattedVideos);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching YouTube videos, using fallback:', err);
        setVideos(FALLBACK_VIDEOS);
        setLoading(false);
      }
    };

    if (playlistId) {
      fetchVideos();
    }
  }, [playlistId]);

  return { videos, loading, error };
};

export default useYouTubePlaylist;
