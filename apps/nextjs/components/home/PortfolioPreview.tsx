'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { MOCK_PROJECTS } from '@/lib/sanity';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import AnimatedSection from '@/components/ui/AnimatedSection';

const categoryColors: Record<string, 'blue' | 'purple' | 'cyan' | 'green'> = {
  Government: 'green',
  Enterprise: 'blue',
  'AI Solutions': 'purple',
  Branding: 'cyan',
};

const gradients = [
  'from-blue-600/30 to-purple-600/30',
  'from-purple-600/30 to-cyan-600/30',
  'from-emerald-600/30 to-blue-600/30',
];

export default function PortfolioPreview() {
  const featured = MOCK_PROJECTS.filter((p) => p.featured).slice(0, 3);

  return (
    <section id="portfolio" className="py-24 bg-gradient-to-b from-[#0d0d18] to-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
              Featured Work
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Proof in Production
            </h2>
          </div>
          <Link href="/portfolio">
            <Button variant="secondary">
              View All Work <ArrowRight size={16} />
            </Button>
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((project, idx) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Link href={`/portfolio/${project.slug.current}`} className="group block h-full">
                <div className="relative h-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                  {/* Project image / gradient */}
                  <div className={`h-48 bg-gradient-to-br ${gradients[idx]} relative overflow-hidden`}>
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-bold text-white/10">{project._id}</span>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center gap-2 text-white font-medium">
                        <ExternalLink size={16} />
                        View Case Study
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={categoryColors[project.category] ?? 'default'}>
                        {project.category}
                      </Badge>
                      <span className="text-xs text-gray-500">{project.duration}</span>
                    </div>

                    <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      {project.shortDescription}
                    </p>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400 border border-white/10"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-500 border border-white/10">
                          +{project.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
