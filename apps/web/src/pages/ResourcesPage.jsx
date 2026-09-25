
import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, User, ArrowRight, TrendingUp, BookOpen, Lightbulb, BarChart } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import SEO from '@/components/SEO.jsx';
import { CtaBand, InnerHero } from '@/components/inner/InnerKit.jsx';
import { SectionHeading } from '@/components/system/Section.jsx';

const fallbackImage = (e) => {
  e.target.onerror = null;
  e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
};

function PostCard({ post, label, featured, index }) {
  return (
    <motion.article
      className={`post-card ${featured ? 'post-card--featured' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: (index % 3) * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/blog/${post.slug}`} className="post-card__link">
        <div className="post-card__media">
          <img src={post.image} alt="" loading="lazy" decoding="async" onError={fallbackImage} />
          {featured && <span className="work-card__index">Featured</span>}
        </div>
        <div className="post-card__body">
          <p className="work-card__meta">{label}</p>
          <h3 className="post-card__title">{post.title}</h3>
          <p className="work-card__text">{post.excerpt}</p>
          <p className="post-card__byline">
            <span>{post.author}</span>
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
          </p>
          <span className="work-card__cta">Read the article <ArrowRight size={15} aria-hidden="true" /></span>
        </div>
      </Link>
    </motion.article>
  );
}

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

  const categoryLabel = (id) => categories.find((c) => c.id === id)?.label;

  return (
    <>
      <SEO
        title="AI Resources, Blog & Industry Guides | EVOBRAND"
        description="Free AI resources and expert articles from EVOBRAND. Explore enterprise AI, agentic AI, creative AI, ethics, and industry trends."
        keywords="AI resources, AI blog, AI guides, enterprise AI, agentic AI, creative AI, AI trends, AI industry news, EVOBRAND blog"
        canonical="https://evobrand.net/resources"
      />

      <InnerHero
        crumbs={[{ label: 'Resources' }]}
        label="Guides · Research · Video"
        lead="Practical reading"
        emphasis="for busy teams."
        intro="AI trends, technical walkthroughs and execution guides, written for the people who have to make the work happen."
        actions={[
          { to: '#articles', label: 'Browse articles', cta: 'resources-hero-browse' },
          { to: '/our-work/videos', label: 'Watch the video library', cta: 'resources-hero-videos' },
        ]}
        facts={[
          { label: 'Articles', value: `${blogPosts.length} guides and essays` },
          { label: 'Topics', value: `${categories.length - 1} areas, from enterprise AI to ethics` },
          { label: 'Also here', value: 'Video library and free site tools' },
        ]}
      />

      <div className="resource-bar" id="articles">
        <div className="evo-container resource-bar__inner">
          <label className="resource-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search articles</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search articles"
            />
          </label>
          <div className="resource-chips" role="group" aria-label="Filter by topic">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={selectedCategory === category.id}
                onClick={() => { setSelectedCategory(category.id); setCurrentPage(1); }}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedCategory === 'all' && !searchQuery && featuredPosts.length > 0 && (
        <section className="evo-block evo-block--ink" aria-labelledby="featured-heading">
          <div className="evo-container">
            <SectionHeading id="featured-heading" label="Featured" lead="Start" emphasis="with these." />
            <div className="work-grid work-grid--2 mt-space-xl">
              {featuredPosts.map((post, i) => <PostCard key={post.id} post={post} label={categoryLabel(post.category)} index={i} featured />)}
            </div>
          </div>
        </section>
      )}

      <section className="evo-block evo-block--slate" aria-labelledby="latest-heading" aria-live="polite">
        <div className="evo-container">
          <SectionHeading
            id="latest-heading"
            label={searchQuery ? `${filteredPosts.length} results` : 'Latest'}
            lead={searchQuery ? 'Results for' : 'Latest'}
            emphasis={searchQuery ? `“${searchQuery}”` : 'articles.'}
            reveal={false}
          />
          {paginatedPosts.length === 0 ? (
            <p className="evo-intro mt-space-l">No articles match that search yet. Try another word or topic.</p>
          ) : (
            <div className="work-grid work-grid--3 mt-space-xl">
              {paginatedPosts.map((post, i) => <PostCard key={post.id} post={post} label={categoryLabel(post.category)} index={i} />)}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="resource-pages" aria-label="Article pages">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-current={currentPage === index + 1 ? 'page' : undefined}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </nav>
          )}
        </div>
      </section>

      <section className="evo-block evo-block--deep" aria-labelledby="newsletter-heading">
        <div className="evo-container studio-closing__grid">
          <SectionHeading
            id="newsletter-heading"
            label="Newsletter"
            lead="New guides,"
            emphasis="straight to your inbox."
            intro="AI insights, case studies and industry trends. No spam; unsubscribe any time."
          />
          <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.org"
              autoComplete="email"
              required
            />
            <button type="submit" className="evo-btn evo-btn--primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Subscribing…' : subscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>

      <CtaBand
        label="Put it to work"
        lead="Reading is a start."
        emphasis="Let’s build the thing."
        secondary={{ to: '/auditor', label: 'Run the free brand audit', cta: 'resources-band-audit' }}
      />
    </>
  );
};

export default ResourcesPage;
