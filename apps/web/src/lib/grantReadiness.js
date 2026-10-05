// Versioned, self-reported screening rules; never an approval or automated site audit.
export const READINESS_VERSION = '1.0';
export const WEBSITE_CHECKS = [
  ['domain', 'We control our website domain and content.'],
  ['secure', 'Our website and donation links use HTTPS and work.'],
  ['mission', 'Our site clearly explains our mission, programs and organization.'],
  ['mobile', 'Our website is easy to use on mobile and loads quickly.'],
  ['content', 'Our site has useful, original content and working navigation.'],
  ['cta', 'Visitors have a clear way to donate, volunteer or register.'],
  ['landing', 'We have dedicated pages for our primary mission goals.'],
  ['accessible', 'We have checked for accessibility barriers.'],
];
export function assessGrantReadiness(a) {
  const excluded = a.type === 'excluded';
  const eligible = a.country === 'us' && a.registration === 'yes' && a.type === 'charity';
  const eligibility = excluded || (a.country === 'us' && a.registration === 'no') ? 'Likely Ineligible' : eligible ? 'Likely Eligible' : 'Needs Review';
  const websitePoints = WEBSITE_CHECKS.filter(([key]) => a[key] === 'yes').length;
  const website = websitePoints === 8 ? 'Ready' : websitePoints >= 5 && a.domain === 'yes' && a.secure === 'yes' ? 'Improvements Recommended' : 'Significant Improvements Needed';
  const tracking = a.analytics === 'yes' && a.conversions === 'yes' ? 'Ready' : 'Needs Configuration';
  const score = (eligible && !excluded ? 20 : 0) + (a.nonprofits === 'yes' ? 10 : 0) + (a.grant === 'active' ? 10 : 0) + websitePoints * 5 + (a.analytics === 'yes' ? 10 : 0) + (a.conversions === 'yes' ? 10 : 0);
  const next = [];
  if (eligibility !== 'Likely Eligible') next.push({ title: 'Review eligibility first', body: 'Confirm country-specific registration and organization requirements with Google before investing in a launch.', to: 'https://support.google.com/nonprofits/answer/3215869?hl=en' });
  if (a.nonprofits !== 'yes') next.push({ title: 'Confirm Google for Nonprofits status', body: 'Review registration, verification and product activation steps.', to: 'https://www.google.com/nonprofits/' });
  if (website !== 'Ready') next.push({ title: 'Prepare your website', body: 'Address the website checks marked No or Not sure before launching. Prioritize domain control, secure working links and clear mission content.', to: '/services/web-development' });
  if (a.accessible !== 'yes') next.push({ title: 'Check accessibility barriers', body: 'Use the existing accessibility checker to identify areas that need further review.', to: '/accessibility-checker' });
  if (tracking !== 'Ready') next.push({ title: 'Configure outcome tracking', body: 'Connect GA4 and Google Ads conversion tracking to your selected mission goal, then test completed actions.', to: '/book-consultation' });
  if (a.followup !== 'yes') next.push({ title: 'Plan supporter follow-up', body: 'Review how inquiries reach your team or CRM and how supporters receive a timely response.', to: '/services' });
  next.push({ title: a.grant === 'active' ? 'Review your existing campaigns' : a.grant === 'suspended' ? 'Review suspension and policy issues' : 'Plan a mission-focused launch', body: `Build the next step around ${a.objective.toLowerCase()}, with landing pages and reporting that measure completed actions.`, to: '/book-consultation' });
  return { version: READINESS_VERSION, eligibility, website, tracking, score, next };
}
