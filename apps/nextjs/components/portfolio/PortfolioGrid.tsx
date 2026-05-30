'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/types';
import ProjectCard from './ProjectCard';
import { MOCK_PROJECTS } from '@/lib/sanity';

const FILTERS = ['All', 'Government', 'Enterprise', 'AI Solutions', 'Branding'];

export default function PortfolioGrid() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? MOCK_PROJECTS
    : MOCK_PROJECTS.filter((p) => p.category === activeFilter);

  return (
    <div className="space-y-8">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter portfolio by category">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            role="tab"
            aria-selected={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeFilter === filter
                ? 'bg-[#0066ff] text-white shadow-lg shadow-blue-500/25'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            {filter}
            <span className="ml-2 text-xs opacity-60">
              {filter === 'All' ? MOCK_PROJECTS.length : MOCK_PROJECTS.filter(p => p.category === filter).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((project: Project, idx: number) => (
            <ProjectCard key={project._id} project={project} index={idx} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No projects in this category yet.</p>
        </div>
      )}
    </div>
  );
}
