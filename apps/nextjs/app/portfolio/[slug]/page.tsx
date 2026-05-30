import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Clock, Building2, ArrowRight, Tag } from 'lucide-react';
import { MOCK_PROJECTS } from '@/lib/sanity';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_PROJECTS.map((p) => ({ slug: p.slug.current }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = MOCK_PROJECTS.find((p) => p.slug.current === slug);
  if (!project) return { title: 'Project Not Found' };
  return {
    title: project.title,
    description: project.shortDescription,
  };
}

const categoryColors: Record<string, 'blue' | 'purple' | 'cyan' | 'green'> = {
  Government: 'green',
  Enterprise: 'blue',
  'AI Solutions': 'purple',
  Branding: 'cyan',
};

const gradients: Record<string, string> = {
  Government: 'from-emerald-900/80 to-teal-900/80',
  Enterprise: 'from-blue-900/80 to-indigo-900/80',
  'AI Solutions': 'from-purple-900/80 to-violet-900/80',
  Branding: 'from-pink-900/80 to-rose-900/80',
};

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = MOCK_PROJECTS.find((p) => p.slug.current === slug);

  if (!project) notFound();

  const relatedProjects = MOCK_PROJECTS.filter(
    (p) => p._id !== project._id && p.category === project.category
  ).slice(0, 2);

  return (
    <article className="min-h-screen bg-[#0a0a0f] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back nav */}
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors group focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Back to Portfolio
        </Link>

        {/* Hero */}
        <div className={`h-72 sm:h-96 rounded-2xl bg-gradient-to-br ${gradients[project.category] ?? 'from-gray-900 to-slate-900'} mb-10 relative overflow-hidden flex items-end p-8`}>
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative">
            <Badge variant={categoryColors[project.category] ?? 'default'} className="mb-3">
              {project.category}
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              {project.title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <section aria-labelledby="overview-heading">
              <h2 id="overview-heading" className="text-xl font-semibold text-white mb-4">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{project.description}</p>
            </section>

            <section aria-labelledby="results-heading">
              <h2 id="results-heading" className="text-xl font-semibold text-white mb-4">Key Results</h2>
              <div className="space-y-3">
                {project.results.map((result) => (
                  <div key={result} className="flex items-start gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                    <Check size={16} className="text-green-400 shrink-0 mt-0.5" />
                    <p className="text-gray-200 text-sm">{result}</p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="tech-heading">
              <h2 id="tech-heading" className="text-xl font-semibold text-white mb-4">Technology Stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside aria-label="Project details">
            <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/10 sticky top-24">
              {[
                { icon: Building2, label: 'Client', value: project.client },
                { icon: Clock, label: 'Duration', value: project.duration },
                { icon: Tag, label: 'Category', value: project.category },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 flex items-start gap-3">
                  <Icon size={16} className="text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="text-white text-sm font-medium">{value}</p>
                  </div>
                </div>
              ))}
              <div className="p-5">
                <Link href="/booking">
                  <Button className="w-full" size="sm">
                    Discuss a Similar Project
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Related projects */}
        {relatedProjects.length > 0 && (
          <section className="mt-16 pt-12 border-t border-white/10" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-semibold text-white mb-6">Related Work</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedProjects.map((related) => (
                <Link key={related._id} href={`/portfolio/${related.slug.current}`} className="group block">
                  <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                    <Badge variant={categoryColors[related.category] ?? 'default'} className="mb-3">
                      {related.category}
                    </Badge>
                    <h3 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{related.shortDescription}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
