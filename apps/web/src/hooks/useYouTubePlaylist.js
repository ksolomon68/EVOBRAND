import { useState, useEffect } from 'react';
import axios from 'axios';

const CACHE_KEY_PREFIX = 'yt_playlist_cache_';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const FALLBACK_VIDEOS = [
  {
    id: 'TLV50pXKRCI',
    title: "Series Launch Invitation",
    description: "Series Launch Invitation",
    thumbnail: 'https://img.youtube.com/vi/TLV50pXKRCI/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'u2Yyt07mhP0',
    title: "Begin your brand transformation",
    description: "Begin your brand transformation",
    thumbnail: 'https://img.youtube.com/vi/u2Yyt07mhP0/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'PA4AbGoPR7E',
    title: "Collaboration is the new currency.",
    description: "Collaboration is the new currency.",
    thumbnail: 'https://img.youtube.com/vi/PA4AbGoPR7E/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'cXRY1fVVtrw',
    title: "Does Your Brand REFLECT Your TRUE Values",
    description: "Does Your Brand REFLECT Your TRUE Values",
    thumbnail: 'https://img.youtube.com/vi/cXRY1fVVtrw/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'XgZPQAV5bNs',
    title: "The goal is not to post more. The goal is to post with intention.",
    description: "The goal is not to post more. The goal is to post with intention.",
    thumbnail: 'https://img.youtube.com/vi/XgZPQAV5bNs/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'Bb5qoCV1ytY',
    title: "Identity first. Strategy second.",
    description: "Identity first. Strategy second.",
    thumbnail: 'https://img.youtube.com/vi/Bb5qoCV1ytY/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'FEQN_UAzvjU',
    title: "You're always broadcasting something",
    description: "You're always broadcasting something",
    thumbnail: 'https://img.youtube.com/vi/FEQN_UAzvjU/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'muMtb_HwFR0',
    title: "A brand is not a logo.",
    description: "A brand is not a logo.",
    thumbnail: 'https://img.youtube.com/vi/muMtb_HwFR0/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'o7HOIt-FVvM',
    title: "Sustainable growth isn’t a sprint. It’s a rhythm.",
    description: "Sustainable growth isn’t a sprint. It’s a rhythm.",
    thumbnail: 'https://img.youtube.com/vi/o7HOIt-FVvM/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'NUoCNopJOP0',
    title: "Is your brand speaking clearly? 🔇",
    description: "Is your brand speaking clearly? 🔇",
    thumbnail: 'https://img.youtube.com/vi/NUoCNopJOP0/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'qEG_2v7VJ64',
    title: "Is your brand having an identity crisis? 🎭",
    description: "Is your brand having an identity crisis? 🎭",
    thumbnail: 'https://img.youtube.com/vi/qEG_2v7VJ64/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: '8Q7tgBEyB-4',
    title: "Drowning in busy work? 🌊 You're not alone.",
    description: "Drowning in busy work? 🌊 You're not alone.",
    thumbnail: 'https://img.youtube.com/vi/8Q7tgBEyB-4/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'HkX-cZu6Vko',
    title: "🚀 Stop losing productivity to paperwork.",
    description: "🚀 Stop losing productivity to paperwork.",
    thumbnail: 'https://img.youtube.com/vi/HkX-cZu6Vko/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'PsgH_n6qXA0',
    title: "Can Automation REALLY Boost Payroll Accuracy to 99.8%?",
    description: "Can Automation REALLY Boost Payroll Accuracy to 99.8%?",
    thumbnail: 'https://img.youtube.com/vi/PsgH_n6qXA0/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: '8ebtCrJlaM4',
    title: "Unlock Your Time: Automate With Intention",
    description: "Unlock Your Time: Automate With Intention",
    thumbnail: 'https://img.youtube.com/vi/8ebtCrJlaM4/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'JLYwAFjTaTE',
    title: "Are You Paying The Dabbler's Tax? 👑",
    description: "Are You Paying The Dabbler's Tax? 👑",
    thumbnail: 'https://img.youtube.com/vi/JLYwAFjTaTE/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'zwIvSEwbyYc',
    title: "Your mission is too important to fail because of bad systems. 💙",
    description: "Your mission is too important to fail because of bad systems. 💙",
    thumbnail: 'https://img.youtube.com/vi/zwIvSEwbyYc/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'UWKqogq082U',
    title: "Scaling shouldn't feel like drowning. 📦→⚡",
    description: "Scaling shouldn't feel like drowning. 📦→⚡",
    thumbnail: 'https://img.youtube.com/vi/UWKqogq082U/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'Q5Vm8JQ3L7U',
    title: "The Unsubscriber's Lament",
    description: "The Unsubscriber's Lament",
    thumbnail: 'https://img.youtube.com/vi/Q5Vm8JQ3L7U/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'ViRsWHj3SQo',
    title: "From Burnout to Breakthrough: How AI Transformed Mark’s Marketing Team",
    description: "From Burnout to Breakthrough: How AI Transformed Mark’s Marketing Team",
    thumbnail: 'https://img.youtube.com/vi/ViRsWHj3SQo/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'X3ijPs2Wn-U',
    title: "Stop Dabbling in AI. Start Architecting Your Future. 🚀",
    description: "Stop Dabbling in AI. Start Architecting Your Future. 🚀",
    thumbnail: 'https://img.youtube.com/vi/X3ijPs2Wn-U/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'ybP6TJGzagQ',
    title: "Beyond the Checkbox: True Digital Accessibility.",
    description: "Beyond the Checkbox: True Digital Accessibility.",
    thumbnail: 'https://img.youtube.com/vi/ybP6TJGzagQ/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'Vr-LzMDY6NI',
    title: "The Report Nobody Could Find\" | AI for Government Agencies | EVOBRAND",
    description: "The Report Nobody Could Find\" | AI for Government Agencies | EVOBRAND",
    thumbnail: 'https://img.youtube.com/vi/Vr-LzMDY6NI/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'AhOIC6s4vls',
    title: "The Grant That Almost Didn't Happen",
    description: "The Grant That Almost Didn't Happen",
    thumbnail: 'https://img.youtube.com/vi/AhOIC6s4vls/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'GhvaTc8uhj4',
    title: "Stop Dabbling. Start Architecting. 🏛️",
    description: "Stop Dabbling. Start Architecting. 🏛️",
    thumbnail: 'https://img.youtube.com/vi/GhvaTc8uhj4/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'VzHNnybz4mQ',
    title: "Some systems aren't worth saving.",
    description: "Some systems aren't worth saving.",
    thumbnail: 'https://img.youtube.com/vi/VzHNnybz4mQ/hqdefault.jpg',
    publishedAt: '2026-01-01T12:00:00Z',
  }
];

const withFallbackDates = () =>
  FALLBACK_VIDEOS.map((video, i) => {
    const publishedAt = new Date(Date.now() - i * 4 * 24 * 60 * 60 * 1000).toISOString();
    return { ...video, publishedAt };
  });

const byNewestFirst = (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

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
        setVideos(withFallbackDates());
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

        const sortedVideos = formattedVideos.slice().sort(byNewestFirst);

        // Save to cache
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            videos: sortedVideos
          }));
        } catch (e) {
          // Ignore cache write errors
        }

        setVideos(sortedVideos);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching YouTube videos, using fallback:', err);
        setVideos(withFallbackDates());
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
