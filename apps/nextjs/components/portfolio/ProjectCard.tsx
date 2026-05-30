'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Project } from '@/types';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const categoryColors: Record<string, 'blue' | 'purple' | 'cyan' | 'green'> = {
  Government: 'green',
  Enterprise: 'blue',
  'AI Solutions': 'purple',
  Branding: 'cyan',
};

const gradients = [
  'from-blue-900/60 to-indigo-900/60',
  'from-purple-900/60 to-pink-900/60',
  'from-teal-900/60 to-cyan-900/60',
  'from-amber-900/60 to-orange-900/60',
  'from-emerald-900/60 to-teal-900/60',
  'from-violet-900/60 to-purple-900/60',
];

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      layout
    >
      <Link href={`/portfolio/${project.slug.current}`} className="group block">
        <article className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 h-full flex flex-col">
          {/* Image / Gradient thumbnail */}
          <div className={cn('h-52 bg-gradient-to-br relative overflow-hidden', gradient)}>
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
              }}
            />
            <div className="absolute inset-0 flex items-end p-5">
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm text-xs text-white/80 border border-white/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="flex items-center gap-2 text-white font-semibold">
                View Case Study <ArrowUpRight size={18} />
              </span>
            </div>
          </div>

          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
              <Badge variant={categoryColors[project.category] ?? 'default'}>
                {project.category}
              </Badge>
              <span className="text-xs text-gray-500">{project.duration}</span>
            </div>

            <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors leading-snug">
              {project.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed flex-1">{project.shortDescription}</p>

            {/* Key results */}
            {project.results.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Key Outcome</p>
                <p className="text-green-400 text-sm font-medium">{project.results[0]}</p>
              </div>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
