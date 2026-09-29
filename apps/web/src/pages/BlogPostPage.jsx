import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO.jsx';
import { Calendar, User, ArrowLeft, ArrowRight, Clock, Tag } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : window.location.origin;

const FALLBACK_ARTICLE_IMAGE = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';

const formatDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

const BlogPostPage = () => {
    const { slug } = useParams();
    const post = blogPosts.find(p => p.slug === slug);
    const [email, setEmail] = useState('');
    const [subscribeStatus, setSubscribeStatus] = useState('idle');

    const readingMinutes = useMemo(() => {
        if (!post) return 0;
        const text = post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return Math.max(1, Math.ceil(text.split(' ').length / 220));
    }, [post]);

    const relatedPosts = useMemo(() => {
        if (!post) return [];
        return blogPosts.filter((item) => item.id !== post.id && item.category === post.category).slice(0, 3);
    }, [post]);

    if (!post) {
        return (
            <div className="min-h-screen bg-[#0f1419] flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
                    <p className="text-gray-400 mb-8">The article you are looking for does not exist.</p>
                    <Link to="/resources" className="px-6 py-3 bg-[#22c8e5] text-white rounded-2xl hover:bg-[#1ba3c0] transition-colors">
                        Back to Resources
                    </Link>
                </div>
            </div>
        );
    }

    const canonical = `https://evobrand.net/blog/${post.slug}`;
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: [post.image],
        datePublished: post.date,
        dateModified: post.date,
        mainEntityOfPage: canonical,
        author: { '@type': 'Organization', name: 'EVOBRAND Concepts', url: 'https://evobrand.net/about' },
        publisher: { '@type': 'Organization', name: 'EVOBRAND Concepts', url: 'https://evobrand.net' },
    };

    const handleSubscribe = async (event) => {
        event.preventDefault();
        setSubscribeStatus('loading');
        try {
            const response = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!response.ok) throw new Error('Unable to subscribe.');
            setEmail('');
            setSubscribeStatus('success');
        } catch {
            setSubscribeStatus('error');
        }
    };

    return (
        <>
            <SEO 
                title={post.title}
                description={post.excerpt}
                image={post.image}
                article={true}
                keywords={post.keywords}
                canonical={canonical}
                structuredData={structuredData}
            />

            <article className="min-h-screen bg-[#0f1419] pb-20">
                {/* Hero Image */}
                <div className="h-[40vh] md:h-[50vh] relative overflow-hidden">
                    <img
                        src={post.image || FALLBACK_ARTICLE_IMAGE}
                        alt={post.imageAlt || post.title}
                        onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = FALLBACK_ARTICLE_IMAGE;
                        }}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] to-transparent"></div>

                    <div className="absolute top-8 left-4 md:left-8 z-10">
                        <Link to="/resources" className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors bg-black/30 px-4 py-2 rounded-2xl backdrop-blur-sm">
                            <ArrowLeft size={20} />
                            <span>Back to Resources</span>
                        </Link>
                    </div>
                </div>

                {/* Content Container */}
                <div className="container mx-auto px-4 -mt-32 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto bg-[#1a2332] rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
                    >
                        <div className="p-8 md:p-12">
                            {/* Header */}
                            <div className="flex flex-wrap gap-4 items-center mb-6">
                                <span className="bg-[#22c8e5]/10 text-[#22c8e5] px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
                                    <Tag size={14} />
                                    {post.category.replace('-', ' ')}
                                </span>
                                <span className="flex items-center space-x-2 text-gray-400 text-sm">
                                    <Calendar size={16} />
                                    <span>{formatDate(post.date)}</span>
                                </span>
                                <span className="flex items-center space-x-2 text-gray-400 text-sm">
                                    <User size={16} />
                                    <span>{post.author}</span>
                                </span>
                                <span className="flex items-center space-x-2 text-gray-400 text-sm">
                                    <Clock size={16} />
                                    <span>{readingMinutes} min read</span>
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <div className="article-takeaway">
                                <p className="text-gray-400 text-sm uppercase tracking-wide">The takeaway</p>
                                <p>{post.takeaway}</p>
                            </div>

                            <div
                                className="article-body"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            <section className="article-newsletter" aria-labelledby="article-newsletter-heading">
                                <p className="evo-eyebrow">The useful ideas list</p>
                                <h2 id="article-newsletter-heading">One practical guide at a time.</h2>
                                <p>Clear advice on websites, AI, automation, accessibility, and building better systems—written for people running the business.</p>
                                <form onSubmit={handleSubscribe} className="newsletter-form">
                                    <label htmlFor="article-newsletter-email" className="sr-only">Email address</label>
                                    <input
                                        id="article-newsletter-email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="you@business.com"
                                        autoComplete="email"
                                        required
                                    />
                                    <button type="submit" className="evo-btn evo-btn--primary" disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}>
                                        {subscribeStatus === 'loading' ? 'Subscribing…' : subscribeStatus === 'success' ? 'You’re subscribed' : 'Send me the next guide'}
                                    </button>
                                </form>
                                <p className="article-newsletter__status" aria-live="polite">
                                    {subscribeStatus === 'success' && 'Welcome. Watch your inbox for the next practical guide.'}
                                    {subscribeStatus === 'error' && 'We could not add you right now. Please try again.'}
                                </p>
                            </section>

                            {relatedPosts.length > 0 && (
                                <section className="article-related" aria-labelledby="related-reading-heading">
                                    <h2 id="related-reading-heading">Keep learning</h2>
                                    <div>
                                        {relatedPosts.map((related) => (
                                            <Link key={related.id} to={`/blog/${related.slug}`}>
                                                <span>{related.title}</span>
                                                <ArrowRight size={18} aria-hidden="true" />
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <div className="mt-12 p-6 bg-[#0f1419] rounded-xl flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {post.author.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{post.author}</h3>
                                    <p className="text-gray-400 text-sm">Senior-led strategy, design, and technology since 1999.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </article>
        </>
    );
};

export default BlogPostPage;
