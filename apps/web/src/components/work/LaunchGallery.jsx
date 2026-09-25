import React, { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

// Industries in the data, folded into a few sectors people actually filter by.
const SECTORS = {
  'Non-profit': 'Nonprofit & community',
  Community: 'Nonprofit & community',
  Healthcare: 'Nonprofit & community',
  Government: 'Public sector',
  Insurance: 'Business',
  Retail: 'Business',
  'Fashion & Apparel': 'Business',
  Hospitality: 'Business',
  Entertainment: 'Arts & entertainment',
};
const sectorOf = (item) => SECTORS[item.industry] || 'Business';

/**
 * Recent launches as a compact, filterable gallery. Cards are small; the
 * description slides up over the thumbnail on hover or focus. Filtering
 * reflows the grid with shared-layout animation.
 */
export default function LaunchGallery({ items }) {
  const [filter, setFilter] = useState('All');
  const reduce = useReducedMotion();

  const filters = useMemo(() => {
    const counts = items.reduce((acc, item) => {
      const s = sectorOf(item);
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    return [['All', items.length], ...Object.entries(counts).sort((a, b) => b[1] - a[1])];
  }, [items]);

  const shown = filter === 'All' ? items : items.filter((i) => sectorOf(i) === filter);

  return (
    <div className="launches">
      <div className="resource-chips launches__filters" role="group" aria-label="Filter launches by sector">
        {filters.map(([name, count]) => (
          <button key={name} type="button" aria-pressed={filter === name} onClick={() => setFilter(name)}>
            {name} <span className="launches__count">{count}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{shown.length} projects shown</p>

      <LayoutGroup>
        <motion.ul className="launches__grid" layout={!reduce}>
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((item) => {
              const Tag = item.link ? 'a' : 'div';
              const linkProps = item.link ? { href: item.link, target: '_blank', rel: 'noopener noreferrer' } : {};
              return (
                <motion.li
                  key={item.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Tag className="launch" {...linkProps}>
                    <span className="launch__media">
                      <img src={item.image} alt={`${item.title} website`} loading="lazy" decoding="async" />
                      <span className="launch__overlay">
                        <span>{item.description}</span>
                      </span>
                    </span>
                    <span className="launch__body">
                      <span className="launch__meta">{item.industry}</span>
                      <span className="launch__title">{item.title}</span>
                      {item.link && <ArrowUpRight className="launch__arrow" size={16} aria-hidden="true" />}
                    </span>
                    {item.link && <span className="sr-only"> (opens in new tab)</span>}
                  </Tag>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>
    </div>
  );
}
