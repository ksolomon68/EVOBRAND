
import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, User, ArrowRight, TrendingUp, BookOpen, Lightbulb, BarChart } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import SEO from '@/components/SEO.jsx';

const ResourcesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const categories = [
    { id: 'all', label: 'All Posts', icon: <BookOpen size={20} /> },
    { id: 'enterprise-ai', label: 'Enterprise AI', icon: <BarChart size={20} /> },
    { id: 'agentic-ai', label: 'Agentic AI', icon: <User size={20} /> },
    { id: 'next-gen-tech', label: 'Next-Gen Tech', icon: <TrendingUp size={20} /> },
    { id: 'creative-ai', label: 'Creative AI', icon: <Lightbulb size={20} /> },
    { id: 'ethics-law', label: 'Ethics & Law', icon: <BookOpen size={20} /> },
    { id: 'industry-trends', label: 'Industry Trends', icon: <TrendingUp size={20} /> }
  ];


  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const postsPerPage = 6;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const [status, setStatus] = useState('idle');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      setStatus('loading');
      try {
        const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? 'http://localhost:5000/api/newsletter/subscribe' 
          : 'https://evobrandconcepts.com/api/newsletter/subscribe';

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          setSubscribed(true);
          setEmail('');
          setStatus('idle');
          setTimeout(() => setSubscribed(false), 3000);
        } else {
          setStatus('idle');
          alert('Failed to subscribe. Please try again.');
        }
      } catch (err) {
        setStatus('idle');
        alert('Network error. Please try again.');
      }
    }
  };

  return (
    <>
      <SEO
        title="AI Resources, Blog & Industry Guides | EVOBRAND"
        description="Free AI resources and expert articles from EVOBRAND. Explore enterprise AI, agentic AI, creative AI, ethics, and industry trends. Stay ahead of the AI revolution."
        keywords="AI resources, AI blog, AI guides, enterprise AI, agentic AI, creative AI, AI trends, AI industry news, EVOBRAND blog"
        canonical="https://evobrand.net/resources"
      />

      <div className="min-h-screen bg-[#0f1419]">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-[#1a2332] to-[#0f1419]">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Resources & <span className="text-[#22c8e5]">Insights</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                Stay ahead with the latest AI trends, case studies, and practical guides
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-12 pr-4 py-4 bg-[#1a2332] text-white border border-gray-700 rounded-2xl focus:outline-none focus:border-[#22c8e5]"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 bg-[#1a2332] sticky top-20 z-40">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto space-x-4 pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all flex-shrink-0 ${selectedCategory === category.id
                    ? 'bg-[#22c8e5] text-white'
                    : 'bg-[#0f1419] text-gray-400 hover:text-white'
                    }`}
                >
                  {category.icon}
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        {selectedCategory === 'all' && !searchQuery && (
          <section className="py-20 bg-[#0f1419]">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-white mb-12">Featured Articles</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="bg-[#1a2332] rounded-xl overflow-hidden cursor-pointer group h-full"
                  >
                    <Link to={`/blog/${post.slug}`} className="block h-full">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4 bg-[#22c8e5] text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#22c8e5] transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-400 mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <User size={16} />
                              <span>{post.author}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar size={16} />
                              <span>{new Date(post.date).toLocaleDateString()}</span>
                            </span>
                          </div>
                          <ArrowRight className="text-[#22c8e5] group-hover:translate-x-2 transition-transform" size={20} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section className="py-20 bg-[#0f1419]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white mb-12">
              {searchQuery ? `Search Results (${filteredPosts.length})` : 'Latest Articles'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {paginatedPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-[#1a2332] rounded-xl overflow-hidden cursor-pointer group h-full"
                >
                  <Link to={`/blog/${post.slug}`} className="block h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <span className="text-xs text-[#22c8e5] font-semibold uppercase">
                        {categories.find(c => c.id === post.category)?.label}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-2 mt-2 group-hover:text-[#22c8e5] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <User size={14} />
                          <span>{post.author}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-4 py-2 rounded-2xl font-medium transition-all ${currentPage === index + 1
                      ? 'bg-[#22c8e5] text-white'
                      : 'bg-[#1a2332] text-gray-400 hover:text-white'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-20 bg-[#1a2332]">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
              <p className="text-gray-400 mb-8">
                Subscribe to our newsletter for the latest AI insights, case studies, and industry trends
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 bg-[#0f1419] text-white border border-gray-700 rounded-2xl focus:outline-none focus:border-[#22c8e5]"
                  required
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-4 bg-[#22c8e5] text-white rounded-2xl font-semibold hover:bg-[#1ba3c0] transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? 'Subscribing...' : subscribed ? 'Subscribed!' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ResourcesPage;
