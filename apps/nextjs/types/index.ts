export interface Booking {
  id?: string;
  service: string;
  service_price: number;
  date: string;
  time_slot: string;
  name: string;
  company: string;
  email: string;
  role: string;
  stripe_session_id?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
}

export interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  category: 'Government' | 'Enterprise' | 'AI Solutions' | 'Branding';
  description: string;
  shortDescription: string;
  techStack: string[];
  imageUrl?: string;
  featured: boolean;
  client: string;
  duration: string;
  results: string[];
  publishedAt: string;
}

export interface Quote {
  id?: string;
  project_types: string[];
  budget_range: string;
  timeline: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  how_heard: string;
  additional_info?: string;
  status: 'new' | 'contacted' | 'in_progress' | 'closed';
  created_at?: string;
}

export interface Contract {
  id?: string;
  company_name: string;
  contact_name: string;
  email: string;
  address: string;
  project_description: string;
  timeline: string;
  total_value: number;
  payment_schedule: 'full' | '50-50' | '3-installments';
  clauses: ContractClause[];
  initials: string;
  signature_date?: string;
  status: 'draft' | 'signed' | 'active';
  created_at?: string;
}

export interface ContractClause {
  id: string;
  title: string;
  included: boolean;
}

export interface Testimonial {
  _id: string;
  name: string;
  title: string;
  company: string;
  content: string;
  rating: number;
  imageUrl?: string;
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  startingPrice?: number;
}

export interface SupportTicket {
  id?: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  plan: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface PricingPlan {
  name: string;
  price: number | null;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  stripePriceId?: string;
}
