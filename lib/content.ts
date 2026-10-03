export const site = {
  name: "Prasoon Katiyar",
  title: "Prasoon Katiyar, full-stack developer",
  description:
    "Computer science student at Galgotias College building full-stack web apps with React, TypeScript, Node.js and language models.",
  email: "katiyarprasoon003@gmail.com",
  /** Shown in Contact once filled in, e.g. "+91 98765 43210". Leave empty to hide. */
  phone: "",
  location: "Greater Noida, India",
  links: {
    github: "https://github.com/Prasoon005",
    linkedin: "https://www.linkedin.com/in/prasoon-katiyar-b7b629300",
    leetcode: "https://leetcode.com/u/oELnIigPa0",
  },
};

/** Three beats on the rolling drum. `tail` is always set in Instrument Serif. */
export const headlines = [
  { lead: "Prasoon Katiyar", tail: "builds for the web." },
  { lead: "Built full stack,", tail: "with AI inside." },
  { lead: "Solid code,", tail: "liquid ideas." },
];

export const nav = [
  { label: "About", href: "#about" },
  { label: "Journey", href: "#journey" },
  { label: "Work", href: "#work" },
  { label: "Toolkit", href: "#toolkit" },
];

export const about = {
  statement:
    "I build products end to end: the schema, the API and the screen people touch. Lately, language models inside real apps, with guardrails.",
  facts: [
    { term: "Studying", detail: "B.Tech CSE, Galgotias College" },
    { term: "Based in", detail: "Greater Noida, India" },
    { term: "Focus", detail: "Full stack, with AI inside" },
  ],
  stats: [
    { value: "600+", label: "Problems solved" },
    { value: "4-star", label: "HackerRank, problem solving" },
    { value: "4", label: "Products shipped end to end" },
    { value: "2027", label: "Graduating" },
  ],
  /** The exploded stack, top to bottom. */
  layers: [
    { name: "Interface", detail: "React, TypeScript", note: "What people see and touch." },
    { name: "Intelligence", detail: "Gemini, Zod, guardrails", note: "Models, kept on a short leash." },
    { name: "API", detail: "Node.js, Express, JWT", note: "Contracts the screen can trust." },
    { name: "Data", detail: "PostgreSQL, Prisma, MongoDB", note: "Schemas that hold their shape." },
  ],
};

// TODO: replace with your own milestones; add internships, hackathons and exact years.
export const journey = [
  {
    period: "2023",
    title: "B.Tech in Computer Science",
    body: "Galgotias College, Greater Noida. C, C++, data structures, DBMS, OS, networks.",
  },
  {
    period: "Foundations",
    title: "600+ problems solved",
    body: "Daily practice on LeetCode and Code360. 4-star on HackerRank.",
  },
  {
    period: "Building",
    title: "Scripts became products",
    body: "Face recognition attendance, a job tracker, then EduSphere AI on PostgreSQL.",
  },
  {
    period: "Certified",
    title: "Certifications along the way",
    body: "React (Infosys), CSS and SQL (HackerRank), ML and prompt engineering (Coding Ninjas), Deloitte analytics.",
  },
  {
    period: "Now",
    title: "Models inside real apps",
    body: "HealthAI: Gemini output validated with Zod, behind a deterministic safety layer.",
  },
  {
    period: "2027",
    title: "Graduating",
    body: "Open to software engineering roles.",
  },
];

export interface Project {
  name: string;
  /** Which animated blueprint stands in for a screenshot. */
  mock: "health" | "edu" | "kanban" | "vision";
  category: string;
  summary: string;
  highlights: string[];
  stack: string[];
  href: string;
  linkLabel: string;
}

// TODO: swap the profile links below for each project's own repo URL.
export const projects: Project[] = [
  {
    name: "HealthAI",
    mock: "health",
    category: "AI · Health",
    summary: "A personal health workspace for vitals, medications and medical records, with AI insights on a short leash.",
    highlights: [
      "Turborepo monorepo with a layered route, controller, service and repository backend on PostgreSQL through Prisma.",
      "Gemini responses validated with Zod into structured symptom analyses and 16-section health reports.",
      "Deterministic safety layer: redacts around 50 drug and brand names and escalates emergency keywords.",
      "Medical Vault with OCR via Tesseract.js, JWT refresh tokens, bcrypt and user-scoped queries.",
    ],
    stack: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Prisma", "Gemini", "Docker"],
    href: "https://github.com/Prasoon005/AI-Healthcare-Assistant",
    linkLabel: "View code on GitHub",
  },
  {
    name: "EduSphere AI",
    mock: "edu",
    category: "Education platform",
    summary: "An academic management platform covering students, teachers, classes, attendance, exams, marks and notices.",
    highlights: [
      "JWT authentication with role-based access for admins, teachers and students.",
      "Validated, paginated REST APIs on PostgreSQL, documented in Swagger and rate-limited.",
      "Role-specific dashboards and student performance analytics, backed by automated tests.",
    ],
    stack: ["React", "TypeScript", "Express", "PostgreSQL", "Prisma", "Swagger"],
    href: "https://github.com/Prasoon005",
    linkLabel: "View on GitHub",
  },
  {
    name: "Job Application Tracker",
    mock: "kanban",
    category: "Productivity",
    summary: "One dashboard for every application, from wishlist to offer.",
    highlights: [
      "Five-stage workflow: wishlist, applied, interview, offer and rejected.",
      "Each application keeps the exact resume version that was sent with it.",
      "Search, filters and analytics charts, with data isolated per user.",
    ],
    stack: ["Node.js", "Express", "MongoDB", "JavaScript", "JWT"],
    href: "https://github.com/Prasoon005",
    linkLabel: "View on GitHub",
  },
  {
    name: "Face Recognition Attendance",
    mock: "vision",
    category: "Computer vision",
    summary: "Webcam attendance that recognises people instead of reading a roll call.",
    highlights: [
      "Real-time detection and matching against 20+ registered faces using precomputed encodings.",
      "Daily logs in Supabase with duplicate-entry prevention and usage limits.",
    ],
    stack: ["Python", "OpenCV", "face_recognition", "Supabase"],
    href: "https://github.com/Prasoon005",
    linkLabel: "View on GitHub",
  },
];

export const toolkit = [
  { group: "Languages", items: ["C", "C++", "Python", "JavaScript", "TypeScript", "SQL"] },
  { group: "Frontend", items: ["React", "HTML", "CSS"] },
  { group: "Backend", items: ["Node.js", "Express", "Flask", "REST APIs", "JWT auth", "Prisma"] },
  { group: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB", "Supabase"] },
  { group: "AI and LLMs", items: ["Gemini API", "LangChain", "RAG", "Prompt engineering", "OpenCV"] },
  { group: "Tools", items: ["Git", "GitHub", "Docker", "Excel", "Tableau"] },
  { group: "Fundamentals", items: ["Data structures and algorithms", "OOP", "DBMS", "Operating systems", "Networks"] },
];

export const certifications = [
  { name: "ReactJS", issuer: "Infosys" },
  { name: "CSS", issuer: "HackerRank" },
  { name: "SQL", issuer: "HackerRank" },
  { name: "Machine learning", issuer: "Coding Ninjas" },
  { name: "Prompt engineering", issuer: "Coding Ninjas" },
  { name: "Data analytics job simulation", issuer: "Deloitte, via Forage" },
];
