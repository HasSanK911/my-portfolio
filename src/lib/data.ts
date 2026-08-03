/**
 * Single source of truth for every piece of CV content on the site.
 * Sections read from here so copy changes never require touching components.
 */

export const profile = {
  firstName: "Ali Hassan",
  lastName: "Kaleemi",
  fullName: "Ali Hassan Kaleemi",
  initials: "AHK",
  role: "Frontend Developer",
  tagline: "Angular & React specialist building web apps, PWAs and admin dashboards.",
  location: "Swabi, Pakistan",
  timezone: "PKT · UTC+5",
  email: "alihassankaleemi.uoswabi@gmail.com",
  phone: "+92 321 9964654",
  phoneHref: "+923219964654",
  availability: "Open to relocation & remote roles",
  yearsExperience: "4+",
  summary:
    "I'm a Computer Science graduate who has been building for the web since 2022, specialising in Angular and React.js. I design and develop websites, progressive web applications and admin dashboards — for early-stage startups and established companies alike.",
  longSummary: [
    "I'm a Computer Science graduate who has been building for the web since 2022, specialising in Angular and React.js. My work spans marketing sites, progressive web applications and dense enterprise admin dashboards.",
    "Over the last four years I've shipped 30+ projects for both early-stage startups and established companies — enterprise asset management, healthcare claims, IPTV scheduling, HR portals, fintech-adjacent currency exchange and e-commerce. The twelve written up here are the major ones, the builds I'd hand over first. I care about the details that make an interface feel considered: motion that carries meaning, type that holds a hierarchy, and states that never leave a user guessing.",
    "I'm fluent in English and Urdu, and open to both relocation and remote opportunities.",
  ],
  languages: ["English", "Urdu"],
  socials: [
    { label: "Email", href: "mailto:alihassankaleemi.uoswabi@gmail.com", handle: "alihassankaleemi.uoswabi@gmail.com" },
    { label: "GitHub", href: "https://github.com/HasSanK911", handle: "@HasSanK911" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/ali-hassan-kaleemi-b5a81925b/",
      handle: "in/ali-hassan-kaleemi",
    },
    { label: "WhatsApp", href: "https://wa.me/923219964654", handle: "+92 321 9964654" },
  ],
} as const;

/* ------------------------------------------------------------------ stats */

export const stats = [
  { value: "4+", label: "Years building", detail: "Front-end since 2022" },
  { value: "30+", label: "Projects shipped", detail: "12 major builds detailed" },
  { value: "6", label: "Industries shipped in", detail: "Fintech to healthcare" },
  { value: "3.32", label: "CGPA, BSCS", detail: "University of Swabi" },
] as const;

/* --------------------------------------------------------------- projects */

export type ProjectLink = { label: string; href: string };

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  period: string;
  /** Sort key — end year/month as a number, higher is more recent. */
  order: number;
  role: string;
  stack: string[];
  summary: string;
  highlights: string[];
  facts: { label: string; value: string }[];
  featured: boolean;
  /** Number of placeholder slots rendered in the case-study gallery. */
  gallery: number;
  links?: ProjectLink[];
};

export const projects: Project[] = [
  {
    slug: "jobero",
    title: "Jobero",
    subtitle: "Job management platform for trade & service businesses",
    category: "Job management SaaS",
    period: "Jun 2026 — Present",
    order: 202699,
    role: "Front-end Developer",
    stack: ["Responsive UI", "Dashboards", "Scheduling", "Some back-end"],
    summary:
      "A job management web application built for trade and service businesses — electricians, plumbers and HVAC technicians. It carries a job end to end, from the first inquiry through to the final invoice. The interface is mine end to end; I've handled enough of the back-end and data model to keep it moving, though that side isn't my specialism.",
    highlights: [
      "End-to-end job tracking from initial inquiry through to final invoice.",
      "Staff scheduling and real-time job dashboards for office coordinators.",
      "Quote and estimate generation with timesheet management.",
      "Automated payment reminders to shorten the collection cycle.",
      "One responsive interface serving both field technicians on mobile and office staff on desktop.",
    ],
    facts: [
      { label: "Status", value: "In active development" },
      { label: "Scope", value: "Front-end lead" },
      { label: "Audience", value: "Field & office workflows" },
    ],
    featured: true,
    gallery: 4,
  },
  {
    slug: "london-fra",
    title: "London FRA",
    subtitle: "Premium SPA for a fire risk assessment consultancy",
    category: "Marketing site",
    period: "Jun 2026",
    order: 202606,
    role: "Design & Front-end",
    stack: ["Angular 21", "Tailwind CSS", "SEO", "reCAPTCHA v3"],
    summary:
      "A premium Angular 21 single-page application for a fire risk assessment consultancy serving all 32 London boroughs — built on a bespoke glassmorphism design system.",
    highlights: [
      "Bespoke glassmorphism design system in Tailwind CSS with dark/light theming and CSS custom properties.",
      "Scroll-triggered animations tuned for a calm, agency-quality feel.",
      "Reactive contact form protected by reCAPTCHA v3.",
      "Dynamic SEO through a custom SeoService plus full structured-data markup for local business discoverability.",
      "Accreditation marquee, multi-section service pages, a blog with dynamic routing and a pricing page.",
      "Performance-first: preloaded fonts, inline CSS preloader and an optimised asset pipeline.",
    ],
    facts: [
      { label: "Coverage", value: "32 London boroughs" },
      { label: "Design system", value: "Bespoke glassmorphism" },
      { label: "Theming", value: "Dark / light" },
    ],
    featured: true,
    gallery: 5,
    links: [{ label: "Visit site", href: "https://londonfra.co.uk" }],
  },
  {
    slug: "tesla-electrics",
    title: "Tesla Electrics",
    subtitle: "Marketing site for a NICEIC-registered electrical contractor",
    category: "Marketing site",
    period: "May 2026 — Jun 2026",
    order: 202605,
    role: "Front-end Developer",
    stack: ["Angular 21", "Bootstrap", "JSON-LD", "jQuery"],
    summary:
      "A marketing website for a NICEIC-registered electrical contracting firm, covering a comprehensive service catalogue across domestic, commercial, fire safety and compliance work.",
    highlights: [
      "Angular 21 with standalone components and lazy-loaded routes on a Bootstrap-based theme.",
      "Complete SEO infrastructure: structured data (JSON-LD), dynamic meta tags, XML sitemap and Open Graph tags.",
      "Calendly booking widget, reCAPTCHA-protected contact form and a WhatsApp floating action button.",
      "Performance work: self-hosted fonts, critical CSS inlining, LCP image preloading and a custom Angular preloader.",
      "Full mobile responsiveness with a jQuery-powered side menu and smooth fragment-based anchor navigation.",
    ],
    facts: [
      { label: "Accreditation", value: "NICEIC-registered" },
      { label: "Focus", value: "SEO + Core Web Vitals" },
      { label: "Routing", value: "Lazy-loaded" },
    ],
    featured: true,
    gallery: 4,
    links: [{ label: "Visit site", href: "https://teslaelectrics.co.uk" }],
  },
  {
    slug: "awal-hr",
    title: "Awal HR Management System",
    subtitle: "Bilingual enterprise HR portal with 20+ modules",
    category: "Enterprise dashboard",
    period: "Feb 2025 — Jun 2026",
    order: 202604,
    role: "Front-end Developer",
    stack: ["Angular 17", "Angular Signals", "PrimeNG", "SignalR", "ngx-translate", "Chart.js"],
    summary:
      "A full-featured enterprise HR portal built on Angular 17 with standalone components and Angular Signals for reactive state management — the largest system I've worked on.",
    highlights: [
      "20+ modules covering employee lifecycle, attendance, payroll, leave, contracts and performance evaluation.",
      "Real-time notifications delivered over SignalR.",
      "Bilingual English/Arabic RTL-aware interface via ngx-translate with dynamic language switching.",
      "PrimeNG and Angular Material combined into one consistent UI language.",
      "Chart.js analytics dashboards, Quill rich-text editing and barcode generation for contracts.",
      "Role-based access control enforced through granular permission directives.",
      "Deployed on Netlify with hash-based routing.",
    ],
    facts: [
      { label: "Modules", value: "20+" },
      { label: "Languages", value: "English / Arabic RTL" },
      { label: "State", value: "Angular Signals" },
    ],
    featured: true,
    gallery: 6,
  },
  {
    slug: "kyrobit",
    title: "Kyrobit",
    subtitle: "Corporate site for a software services provider",
    category: "Corporate site",
    period: "Nov 2025",
    order: 202511,
    role: "Front-end Developer",
    stack: ["Next.js", "React", "Responsive UI"],
    summary:
      "The front-end user interface for Kyrobit, a software services provider — built in Next.js with a focus on clarity, performance and brand consistency.",
    highlights: [
      "Responsive, visually consistent UI layouts across the full site.",
      "Pages structured for clarity and fast perceived performance.",
      "A library of reusable components underpinning every page.",
      "Smooth navigation and optimised rendering throughout.",
    ],
    facts: [
      { label: "Framework", value: "Next.js" },
      { label: "Scope", value: "Full front-end UI" },
      { label: "Focus", value: "Brand identity" },
    ],
    featured: false,
    gallery: 3,
  },
  {
    slug: "zaratelier",
    title: "Zaratelier",
    subtitle: "Fashion & apparel brand storefront",
    category: "E-commerce",
    period: "Jun 2025 — Nov 2025",
    order: 202511,
    role: "Front-end Developer",
    stack: ["Angular", "REST APIs", "Component architecture"],
    summary:
      "Zaratelier.com is a fashion and apparel brand website built in Angular. I handled the user interface end to end alongside the API integrations that drive it.",
    highlights: [
      "Designed and implemented the full user interface for the storefront.",
      "API integrations dynamically fetching product data, categories and editorial content.",
      "A set of reusable Angular components shared across the catalogue.",
      "Responsive, performant layouts verified across device sizes.",
      "Close collaboration with backend services to wire APIs to the front-end cleanly.",
    ],
    facts: [
      { label: "Domain", value: "zaratelier.com" },
      { label: "Framework", value: "Angular" },
      { label: "Focus", value: "Shopping experience" },
    ],
    featured: true,
    gallery: 5,
    links: [{ label: "Visit site", href: "https://zaratelier.com" }],
  },
  {
    slug: "easygiv",
    title: "EasyGiv",
    subtitle: "Donation and fundraising platform",
    category: "Non-profit",
    period: "Oct 2025 — Nov 2025",
    order: 202510,
    role: "Front-end Developer",
    stack: ["Laravel", "PHP", "Blade", "Responsive UI"],
    summary:
      "EasyGiv is a donation and fundraising website built with PHP (Laravel). The brief was trust: every screen had to make giving feel simple and safe.",
    highlights: [
      "Clean, responsive, user-friendly layouts that simplify the donation flow.",
      "Visual consistency and accessibility maintained across donor and organiser journeys.",
      "Front-end views integrated seamlessly into the Laravel framework.",
    ],
    facts: [
      { label: "Stack", value: "Laravel + Blade" },
      { label: "Audience", value: "Donors & organisers" },
      { label: "Priority", value: "Trust & clarity" },
    ],
    featured: false,
    gallery: 3,
  },
  {
    slug: "travel-cashier",
    title: "Travel Cashier",
    subtitle: "Travel-focused currency exchange platform",
    category: "Fintech",
    period: "May 2025 — Aug 2025",
    order: 202508,
    role: "Front-end Developer",
    stack: ["Laravel", "PHP", "Blade", "Responsive UI"],
    summary:
      "TravelCashier.com is a travel-focused currency exchange web platform developed with PHP (Laravel), where the interface had to communicate transparency before anything else.",
    highlights: [
      "Responsive, modern layouts communicating transparency, multi-currency support and fast processing.",
      "Product requirements translated into a visually consistent UI component set.",
      "Cross-device compatibility verified throughout.",
      "Front-end views integrated with the Laravel backend structure.",
    ],
    facts: [
      { label: "Domain", value: "travelcashier.com" },
      { label: "Stack", value: "Laravel + Blade" },
      { label: "Priority", value: "Transparency & trust" },
    ],
    featured: false,
    gallery: 4,
    links: [{ label: "Visit site", href: "https://travelcashier.com" }],
  },
  {
    slug: "medwork",
    title: "Medwork",
    subtitle: "Healthcare claim management system",
    category: "Healthcare",
    period: "Mar 2025 — May 2025",
    order: 202505,
    role: "Front-end Developer",
    stack: ["Angular", "Complex forms", "Data tables"],
    summary:
      "Medwork is a healthcare claim management platform designed to process patient claims accurately at volume — a system where an interface mistake has real consequences.",
    highlights: [
      "Claims generated per patient, each keyed to a unique Assured ID.",
      "Two medication entry types: General Services and Chronic Medications.",
      "Chronic Medications issued once per month; General Services available on demand.",
      "Batch Numbers assigned per patient for accurate tracking and record-keeping.",
      "A structured claim flow that improved processing efficiency and accuracy.",
    ],
    facts: [
      { label: "Domain", value: "Healthcare claims" },
      { label: "Key entity", value: "Assured ID" },
      { label: "Cadence", value: "Monthly chronic cycle" },
    ],
    featured: false,
    gallery: 4,
  },
  {
    slug: "world-iptv",
    title: "World IPTV",
    subtitle: "TV channel management & EPG system",
    category: "Media platform",
    period: "Dec 2024 — Feb 2025",
    order: 202502,
    role: "Front-end Developer",
    stack: ["Next.js", "React", "REST APIs", "UI/UX"],
    summary:
      "World IPTV — also known as EPG — is a TV channel management system built with Next.js, focused on a seamless and dynamic scheduling experience.",
    highlights: [
      "Responsive user interfaces designed and implemented across the platform.",
      "Performance optimisation and smooth navigation for dense schedule views.",
      "API integration with the backend team for real-time channel updates and programme scheduling.",
      "UI/UX enhancements targeted at accessibility and engagement.",
    ],
    facts: [
      { label: "Also known as", value: "EPG" },
      { label: "Framework", value: "Next.js" },
      { label: "Data", value: "Real-time schedules" },
    ],
    featured: true,
    gallery: 4,
  },
  {
    slug: "coresedge",
    title: "CoresEdge",
    subtitle: "Enterprise asset management system",
    category: "Enterprise dashboard",
    period: "May 2024 — Dec 2024",
    order: 202412,
    role: "Front-end Developer",
    stack: ["Angular", "UX workflows", "Design systems"],
    summary:
      "CoresEdge is an Enterprise Asset Management System. Beyond front-end delivery, I took part in the foundational planning of the product itself.",
    highlights: [
      "Contributed to foundational planning alongside the core team.",
      "Designed intuitive workflows for asset lifecycle operations.",
      "Crafted user-friendly layouts for information-dense screens.",
      "Worked closely with backend developers to align on core functionality.",
      "Bridged the gap between design intent and shipped functionality.",
    ],
    facts: [
      { label: "Category", value: "Asset management" },
      { label: "Contribution", value: "Planning + build" },
      { label: "Focus", value: "Workflow design" },
    ],
    featured: false,
    gallery: 4,
  },
  {
    slug: "patronworks",
    title: "PatronWorks",
    subtitle: "Cloud POS for retail and online stores",
    category: "Commerce platform",
    period: "Dec 2022 — Feb 2025",
    order: 202402,
    role: "Front-end Developer",
    stack: ["Angular", "Responsive UI", "POS workflows", "Cloud platform"],
    summary:
      "PatronWorks is a web and cloud-based POS solution for a range of businesses and online stores — my longest-running engagement, and the one where I occasionally stepped outside the front-end to help.",
    highlights: [
      "Front-end development as the role, with the occasional back-end ticket or deployment picked up when the team needed hands.",
      "Scalable solutions designed to support both in-store and online retail.",
      "Streamlined operational flows built to raise day-to-day efficiency.",
      "Close collaboration across teams to guarantee seamless functionality.",
    ],
    facts: [
      { label: "Category", value: "Cloud POS" },
      { label: "Duration", value: "2+ years" },
      { label: "Scope", value: "Front-end, some back-end help" },
    ],
    featured: true,
    gallery: 5,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: undefined, next: undefined };
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}

/* ------------------------------------------------------------- experience */

export type Experience = {
  company: string;
  role: string;
  period: string;
  current: boolean;
  description: string;
  points: string[];
  tags: string[];
};

export const experience: Experience[] = [
  {
    company: "Disrupt Wave Private Limited",
    role: "Frontend Developer",
    period: "Dec 2024 — Present",
    current: true,
    description:
      "Contributing as a Frontend Developer on products that carry real operational weight — delivering solutions built to last rather than to demo.",
    points: [
      "Building a TV channels management system and an insurance management system.",
      "Translating dense domain requirements into interfaces operators can move through quickly.",
      "Focused on delivering cutting-edge solutions that make a lasting impact.",
    ],
    tags: ["Next.js", "Angular", "React", "TypeScript", "Laravel"],
  },
  {
    company: "Tech Creator Private Limited",
    role: "Frontend Developer",
    period: "Dec 2022 — Feb 2025",
    current: false,
    description:
      "Built the front-end of advanced web applications on MEAN and MERN stack products, with an emphasis on design, user experience and performance.",
    points: [
      "Built the front-end of advanced applications on MEAN and MERN stack products.",
      "Collaborated with cross-functional teams to hit project goals efficiently.",
      "Kept large MongoDB-backed datasets fast on the client — pagination, virtual scroll and sensible loading states.",
      "Drove technological excellence and innovation across the front-end practice.",
    ],
    tags: ["Angular", "React", "MEAN / MERN", "MongoDB"],
  },
];

/* ----------------------------------------------------------------- skills */

export type SkillGroup = {
  title: string;
  caption: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Frameworks",
    caption: "What I build products with",
    items: ["Angular", "React.js", "Next.js"],
  },
  {
    title: "Languages & markup",
    caption: "The foundation underneath",
    items: ["TypeScript", "JavaScript", "HTML", "CSS"],
  },
  {
    title: "UI systems",
    caption: "Component libraries & styling",
    items: ["Tailwind CSS", "Bootstrap", "Angular Material", "PrimeNG"],
  },
  {
    title: "Motion & 3D",
    caption: "Making interfaces feel alive",
    items: ["Three.js", "React Three Fiber", "drei", "Framer Motion", "Lenis", "WebGL"],
  },
  {
    title: "Tooling & workflow",
    caption: "How the work gets shipped",
    items: ["Git", "GitLab", "Postman", "Swagger", "Jira", "Trello", "Cursor AI"],
  },
  {
    title: "Performance & delivery",
    caption: "What happens after the build",
    items: ["Netlify", "ESLint", "SEO & structured data", "Core Web Vitals", "WCAG AA"],
  },
  {
    // Deliberately last and deliberately hedged — the front-end is the
    // specialism; this row is only what I've picked up around the edges of it.
    title: "Beyond the front-end",
    caption: "Touched enough to be useful — not where I specialise",
    items: ["Laravel & Blade", "PHP", "MongoDB", "Basic DB design", "Deployments"],
  },
];

/** Flat list used by the infinite marquee strip. */
export const skillMarquee = [
  "Angular",
  "React.js",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "Three.js",
  "React Three Fiber",
  "Framer Motion",
  "Lenis",
  "Laravel",
  "PrimeNG",
  "Angular Material",
  "Bootstrap",
  "HTML",
  "CSS",
  "Git",
  "GitLab",
  "Postman",
  "Swagger",
  "Jira",
  "Trello",
  "Cursor AI",
  "Netlify",
];

/* -------------------------------------------------------------- education */

export type Education = {
  qualification: string;
  institution: string;
  period: string;
  detail?: string;
};

export const education: Education[] = [
  {
    qualification: "Bachelor of Computer Science",
    institution: "University of Swabi",
    period: "Sep 2017 — Dec 2021",
    detail:
      "Graduated with a 3.32 CGPA. Final year project: a web application for an online dog selling system.",
  },
  {
    qualification: "F.Sc Pre-Engineering",
    institution: "Khyber Model College and School, Nowshera",
    period: "Jan 2015 — May 2017",
  },
  {
    qualification: "SSC",
    institution: "Working Folks Grammar Higher Secondary School",
    period: "Mar 2012 — Mar 2014",
  },
];

/* ----------------------------------------------------- honours & seminars */

export type Award = {
  title: string;
  issuer: string;
  date: string;
  detail: string;
};

export const awards: Award[] = [
  {
    title: "Head of the Society of Computer Science and Technology",
    issuer: "University of Swabi",
    date: "10 Oct 2020",
    detail:
      "Elected to lead the Society of Computer Science and Technology at the University of Swabi.",
  },
  {
    title: "Academic Prize Cheques",
    issuer: "University of Swabi",
    date: "4 Oct 2019",
    detail:
      "Rs 8,000 for third position in class in semester 5, and Rs 12,000 for second position in semester 6.",
  },
  {
    title: "Prime Minister Laptop Scheme",
    issuer: "Government of Pakistan",
    date: "10 Oct 2020",
    detail: "Awarded a Haier laptop under the national Prime Minister Laptop Scheme.",
  },
];

export const conferences: Award[] = [
  {
    title: "Webinar on Artificial Intelligence",
    issuer: "University of Swabi",
    date: "12 — 13 Oct 2020",
    detail: "Two-day webinar covering applied artificial intelligence.",
  },
  {
    title: "International Conference on Software Engineering and Computing Discipline",
    issuer: "University of Swabi",
    date: "4 — 6 May 2019",
    detail: "Three-day international conference on software engineering practice.",
  },
];

/* ------------------------------------------------------------- navigation */

export const navLinks = [
  { label: "Work", href: "#work", id: "work" },
  { label: "About", href: "#about", id: "about" },
  { label: "Experience", href: "#experience", id: "experience" },
  { label: "Skills", href: "#skills", id: "skills" },
  { label: "Contact", href: "#contact", id: "contact" },
] as const;

/** Services / capability pillars shown on the about section. */
export const capabilities = [
  {
    title: "Product interfaces",
    body: "Admin dashboards and internal tools where density, state and speed decide whether people actually use the thing.",
  },
  {
    title: "Marketing sites",
    body: "Fast, search-visible sites with structured data, Core Web Vitals discipline and motion that earns its keep.",
  },
  {
    title: "Design systems",
    body: "Token-driven component libraries — theming, RTL, accessibility and consistency that survives a growing team.",
  },
  {
    title: "API integration",
    body: "Wiring front-ends to real backends: real-time streams, complex forms, permissions and error states that make sense.",
  },
] as const;
