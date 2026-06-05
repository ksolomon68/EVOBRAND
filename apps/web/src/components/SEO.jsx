import React from 'react';
import { Helmet } from 'react-helmet';

const SITE_NAME = 'EVOBRAND';
const SITE_URL = 'https://evobrand.net';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_DESCRIPTION = 'EVOBRAND is your partner in AI transformation — delivering custom AI applications, visual content, intelligent automation, and video production to businesses nationwide from Ellis County, TX.';

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
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — AI Transformation Partner | Custom AI Solutions`;

  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : SITE_URL);
  const resolvedImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      {/* ── Primary Meta ── */}
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Keisha Solomon — EVOBRAND Concepts LLC" />
      <link rel="canonical" href={canonicalUrl} />

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
      <meta property="og:image:alt" content={`${SITE_NAME} — AI Transformation Partner`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* ── Twitter / X ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />
      <meta name="twitter:image:alt" content={`${SITE_NAME} — AI Transformation Partner`} />
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
