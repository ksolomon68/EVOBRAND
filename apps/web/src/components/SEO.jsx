import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

const SITE_NAME = 'EVOBRAND';
const SITE_URL = 'https://evobrand.net';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_DESCRIPTION = 'EVOBRAND Concepts is a full-stack digital agency for government agencies, corporations, and nonprofits. SBE, WBE, and MBE certified. 25+ years. Dallas–Fort Worth, Texas.';

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_OG_IMAGE,
  article = false,
  canonical,
  noindex = false,
  keywords,
  structuredData,
}) => {
  // Pages sometimes include the brand in their own title; only append it once.
  const fullTitle = title
    ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
    : `${SITE_NAME} Concepts | Digital agency since 1999`;

  // Canonical is always the clean evobrand.net path: no query string (utm_*,
  // fbclid…), no hash, no trailing slash, and never the www/old-domain host —
  // so tracked links and mirrors consolidate onto one URL in search results.
  const path = typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') : '';
  const canonicalUrl = canonical || `${SITE_URL}${path || '/'}`;
  const resolvedImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  // index.html ships a default description for crawlers that don't run JS;
  // drop it once a page renders its own so there is only ever one.
  useEffect(() => {
    document.querySelectorAll('meta[data-default-meta]').forEach((el) => el.remove());
  }, []);

  return (
    <Helmet>
      {/* ── Primary Meta ── */}
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Keisha Solomon, EVOBRAND Concepts LLC" />
      {/* A noindex page has nothing to consolidate, so no canonical. */}
      {!noindex && <link rel="canonical" href={canonicalUrl} />}

      {/* ── Robots ── */}
      {noindex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      }

      {/* ── Open Graph ── */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${SITE_NAME} Concepts`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* ── Twitter / X ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />
      <meta name="twitter:image:alt" content={`${SITE_NAME} Concepts`} />
      <meta name="twitter:creator" content="@evobrand" />
      <meta name="twitter:site" content="@evobrand" />

      {/* ── Theme ── */}
      <meta name="theme-color" content="#0f1419" />
      <meta name="msapplication-TileColor" content="#0f1419" />

      {/* ── Structured Data / JSON-LD ── */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
