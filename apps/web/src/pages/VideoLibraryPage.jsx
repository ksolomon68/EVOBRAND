import React from 'react';
import SEO from '@/components/SEO.jsx';
import VideoLibrarySection from '@/components/VideoLibrarySection.jsx';
import { CtaBand, InnerHero } from '@/components/inner/InnerKit.jsx';

export default function VideoLibraryPage() {
  return (
    <>
      <SEO
        title="Video Library | EVOBRAND"
        description="Explore EVOBRAND videos on branding, automation, AI, and business growth: walkthroughs, tutorials, and client stories."
        canonical="https://evobrand.net/our-work/videos"
      />

      <InnerHero
        crumbs={[{ label: 'Our work', to: '/our-work' }, { label: 'Video library' }]}
        label="Our animated series"
        lead="The work,"
        emphasis="explained on screen."
        intro="Fresh drops every week: AI transformations, tutorials, and client success stories. Filter by topic or start with the latest release."
        actions={[
          { to: '#library', label: 'Start watching', cta: 'videos-hero-watch' },
          { to: '/our-work', label: 'See the projects', cta: 'videos-hero-work' },
        ]}
        facts={[
          { label: 'Topics', value: 'Branding, automation, AI and growth' },
          { label: 'New', value: 'Fresh videos every week' },
          { label: 'Format', value: 'Short walkthroughs and stories' },
        ]}
      />

      <div id="library">
        <VideoLibrarySection bare />
      </div>

      <CtaBand
        label="Seen enough?"
        lead="Let’s make the next one"
        emphasis="about your project."
        secondary={{ to: '/our-work', label: 'Back to our work', cta: 'videos-band-work' }}
      />
    </>
  );
}
