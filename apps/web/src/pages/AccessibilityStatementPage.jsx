
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Accessibility, CheckCircle, Mail, Phone } from 'lucide-react';
import SEO from '@/components/SEO.jsx';

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-semibold text-[#22c8e5] mb-4">{title}</h2>
    {children}
  </section>
);

const AccessibilityStatementPage = () => {
  return (
    <>
      <SEO
        title="Accessibility Statement | EVOBRAND"
        description="EVOBRAND's commitment to digital accessibility. Learn about our WCAG 2.1 AA/AAA compliance efforts, known limitations, and how to contact us for assistance."
      />

      {/* Hero */}
      <div className="bg-[#0f1419] border-b border-gray-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#22c8e5]/10 rounded-full mb-6">
              <Accessibility size={32} className="text-[#22c8e5]" aria-hidden="true" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Accessibility Statement</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              EVOBRAND is committed to ensuring digital accessibility for people of all abilities.
            </p>
            <p className="text-gray-500 text-sm mt-4">Last updated: June 14, 2026</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#0f1419] min-h-screen">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-300 space-y-2"
          >

            <Section title="Our Commitment">
              <p className="mb-4">
                EVOBRAND ("we," "us," or "our") is committed to making our website{' '}
                <Link to="/" className="text-[#22c8e5] hover:underline">evobrand.net</Link>{' '}
                accessible to everyone, including people with disabilities. We continuously work to
                improve the accessibility of our digital experiences and strive to conform to the{' '}
                <strong className="text-white">Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>{' '}
                and, where possible, Level AAA.
              </p>
              <p>
                Accessibility is not a checkbox — it is an ongoing commitment woven into how we design,
                build, and maintain our services.
              </p>
            </Section>

            <Section title="Accessibility Features">
              <p className="mb-4">
                Our website includes a built-in Accessibility Widget (activate with{' '}
                <kbd className="inline-block bg-[#1a2332] text-[#22c8e5] text-xs px-2 py-1 rounded border border-gray-700 font-mono">
                  Alt + A
                </kbd>
                ) that provides the following tools:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {[
                  'Screen Reader optimization',
                  'High Contrast mode',
                  'Dark Mode',
                  'Color Desaturation (colorblind support)',
                  'Highlight Links',
                  'Dyslexia-friendly Font',
                  'Large Cursor',
                  'Reading Guide',
                  'Reading Mask',
                  'Stop Animations',
                  'Keyboard Navigation mode',
                  'Force Link Underlines',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-[#22c8e5] shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mb-4">We also offer pre-configured accessibility profiles:</p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                <li><strong className="text-white">Motor Impaired</strong> — enhanced keyboard navigation and interaction targets</li>
                <li><strong className="text-white">Visually Impaired</strong> — high contrast and screen reader optimizations</li>
                <li><strong className="text-white">Color Blind</strong> — desaturated palette for accessible color distinction</li>
                <li><strong className="text-white">Dyslexia</strong> — specialized font and reading aids</li>
              </ul>
            </Section>

            <Section title="Standards & Conformance">
              <p className="mb-4">
                We aim to conform to the following standards:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                <li><strong className="text-white">WCAG 2.1 Level AA</strong> — our baseline compliance target</li>
                <li><strong className="text-white">WCAG 2.1 Level AAA</strong> — pursued where technically feasible</li>
                <li><strong className="text-white">Section 508</strong> of the Rehabilitation Act (US federal standards)</li>
                <li><strong className="text-white">EN 301 549</strong> — European accessibility standard for ICT products and services</li>
              </ul>
              <p className="mt-4">
                We use semantic HTML5, ARIA landmarks and attributes, keyboard-navigable components,
                sufficient color contrast ratios, focus-visible indicators, and skip-navigation links
                throughout the site.
              </p>
            </Section>

            <Section title="Technical Approach">
              <p className="mb-4">We apply the following technical practices to support accessibility:</p>
              <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                <li>Semantic HTML elements and ARIA roles/attributes for all interactive components</li>
                <li>Keyboard focus management with visible focus indicators on all interactive elements</li>
                <li>Skip-to-main-content link at the top of every page</li>
                <li><code className="bg-[#1a2332] px-1 rounded text-[#22c8e5] text-xs">prefers-reduced-motion</code> media query to disable animations for users who request it</li>
                <li>Alt text on all meaningful images; decorative images marked with empty alt attributes</li>
                <li>Form inputs paired with visible or screen-reader-only labels</li>
                <li>ARIA live regions for dynamic content updates</li>
                <li>Color contrast ratios that meet or exceed WCAG AA (4.5:1 for text, 3:1 for UI components)</li>
              </ul>
            </Section>

            <Section title="Known Limitations">
              <p className="mb-4">
                While we strive for full conformance, some areas may have limitations we are actively
                working to resolve:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                <li>Third-party embedded content (e.g., video players, payment processors) may not fully conform to WCAG 2.1 AA</li>
                <li>Some legacy PDF documents may not be fully accessible; we are working to remediate or provide accessible alternatives</li>
                <li>Complex data visualizations in our analytics dashboard are being enhanced with additional text alternatives</li>
              </ul>
              <p className="mt-4">
                We are committed to resolving these issues as quickly as possible. If you encounter a
                barrier, please contact us and we will prioritize a solution or provide an accessible
                alternative.
              </p>
            </Section>

            <Section title="Feedback & Contact">
              <p className="mb-6">
                If you experience any accessibility barriers on our website, or if you would like to
                request information in an alternative accessible format, please contact us. We aim to
                respond to all accessibility-related inquiries within <strong className="text-white">2 business days</strong>.
              </p>
              <div className="bg-[#1a2332] rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={18} className="text-[#22c8e5] shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Email</p>
                    <a href="mailto:info@evobrand.net" className="text-white hover:text-[#22c8e5] transition-colors">
                      info@evobrand.net
                      <span className="sr-only"> (opens email client)</span>
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={18} className="text-[#22c8e5] shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Phone</p>
                    <a href="tel:+12145314427" className="text-white hover:text-[#22c8e5] transition-colors">
                      +1 214-531-4427
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Accessibility size={18} className="text-[#22c8e5] shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Online</p>
                    <Link to="/contact" className="text-white hover:text-[#22c8e5] transition-colors">
                      Contact form at evobrand.net/contact
                    </Link>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Enforcement & Escalation">
              <p className="mb-4">
                If you are not satisfied with our response, you may contact the relevant authority in
                your jurisdiction:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                <li>
                  <strong className="text-white">United States:</strong> U.S. Department of Justice, Civil Rights Division —{' '}
                  <a
                    href="https://www.ada.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#22c8e5] hover:underline"
                  >
                    ada.gov
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </li>
                <li>
                  <strong className="text-white">European Union:</strong> Your national equality body or disability rights authority
                </li>
              </ul>
            </Section>

            <Section title="Ongoing Efforts">
              <p className="mb-4">
                Accessibility at EVOBRAND is an ongoing process. Our efforts include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                <li>Regular automated and manual accessibility audits using industry-standard tools</li>
                <li>User testing with assistive technology users</li>
                <li>Accessibility training for all team members involved in web development and content creation</li>
                <li>Accessibility review as part of our QA process for all new features</li>
                <li>Monitoring for WCAG 2.2 and future standards to stay ahead of requirements</li>
              </ul>
            </Section>

            <div className="border-t border-gray-800 pt-8 text-sm text-gray-500">
              <p>
                This statement was prepared on <strong className="text-gray-400">June 14, 2026</strong> and
                will be reviewed and updated annually or following any significant changes to our website.
              </p>
            </div>

          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AccessibilityStatementPage;
