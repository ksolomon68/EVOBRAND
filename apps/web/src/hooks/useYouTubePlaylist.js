import { useState, useEffect } from 'react';
import axios from 'axios';

const CACHE_KEY_PREFIX = 'yt_playlist_cache_';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const useYouTubePlaylist = (playlistId) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      const cacheKey = `${CACHE_KEY_PREFIX}${playlistId}`;

      if (!apiKey) {
        // For development/demo purposes if key is missing, we can either show error or mock data.
        // Per requirements, we should handle error.
        console.warn('VITE_YOUTUBE_API_KEY is missing in .env file');
        setError('YouTube API Key is missing. Please add VITE_YOUTUBE_API_KEY to your .env file.');
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
        console.error('Error fetching YouTube videos:', err);
        setError(err.response?.data?.error?.message || err.message || 'Failed to fetch videos');
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
