import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO.jsx';
import { Calendar, User, ArrowLeft, Share2, Tag } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';

const BlogPostPage = () => {
    const { slug } = useParams();
    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
        return (
            <div className="min-h-screen bg-[#0f1419] flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
                    <p className="text-gray-400 mb-8">The article you are looking for does not exist.</p>
                    <Link to="/resources" className="px-6 py-3 bg-[#22c8e5] text-white rounded-lg hover:bg-[#1ba3c0] transition-colors">
                        Back to Resources
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO 
                title={post.title}
                description={post.excerpt}
                image={post.image}
                article={true}
            />

            <article className="min-h-screen bg-[#0f1419] pb-20">
                {/* Hero Image */}
                <div className="h-[40vh] md:h-[50vh] relative overflow-hidden">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] to-transparent"></div>

                    <div className="absolute top-8 left-4 md:left-8 z-10">
                        <Link to="/resources" className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
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
                                    <span>{new Date(post.date).toLocaleDateString()}</span>
                                </span>
                                <span className="flex items-center space-x-2 text-gray-400 text-sm">
                                    <User size={16} />
                                    <span>{post.author}</span>
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                {post.title}
                            </h1>

                            {/* Share */}
                            <div className="flex items-center justify-between border-y border-gray-700 py-6 mb-8">
                                <span className="text-gray-400 font-medium">Share this article</span>
                                <button className="text-[#22c8e5] hover:text-white transition-colors p-2 hover:bg-[#22c8e5]/10 rounded-full">
                                    <Share2 size={24} />
                                </button>
                            </div>

                            {/* Content Definition */}
                            <div
                                className="prose prose-lg prose-invert max-w-none text-gray-300"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            >
                            </div>

                            {/* Author Bio (Placeholder) */}
                            <div className="mt-12 p-6 bg-[#0f1419] rounded-xl flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {post.author.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{post.author}</h3>
                                    <p className="text-gray-400 text-sm">Tech Journalist & AI Analyst</p>
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
