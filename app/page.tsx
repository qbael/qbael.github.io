'use client';

import {
  ArrowUpRight,
  Briefcase,
  Code2,
  Cpu,
  ExternalLink,
  FolderGit2,
  Menu,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  FaEnvelope,
  FaFacebook,
  FaFilePdf,
  FaGithub,
  FaLinkedin,
} from 'react-icons/fa6';

import { FileGlyph } from '@/components/file-glyph';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  closeTab,
  openTab,
  resolveDrawerFocus,
  resolveFile,
  shouldHandleNavigation,
  shouldFocusHeading,
  tryNavigation,
  type NavigationOrigin,
  type WorkspaceState,
} from '@/lib/tabs';
import { fetchVisitCount } from '@/lib/visits';

const sectionFiles = [
  { id: 'about', label: 'About', filename: 'about.tsx' },
  { id: 'education', label: 'Education', filename: 'education.json' },
  {
    id: 'achievements',
    label: 'Achievements & Awards',
    filename: 'achievements.yaml',
  },
  { id: 'experience', label: 'Work Experience', filename: 'experience.ts' },
  { id: 'projects', label: 'Projects', filename: 'projects.json' },
  { id: 'skills', label: 'Skills & Tech Stack', filename: 'skills.toml' },
  { id: 'visitors', label: 'Visitor Statistics', filename: 'visitors.log' },
] as const;

const projects = [
  {
    id: 'project-instory',
    name: 'Instory',
    title: 'Instory — Social Media Platform',
    filename: 'Instory.cs',
    dates: 'Mar–May 2026',
    summary:
      'A full-stack Instagram-like platform with real-time chat, story sharing, and social features built with ASP.NET Core and React.',
    built: [
      'Built posts, stories, highlights, hashtag trends, friend requests, and an administration dashboard.',
      'Delivered direct and group chat plus live notifications with SignalR and media uploads to AWS S3.',
      'Added Google OAuth, OTP email verification, clean repository and service layers, and hybrid hashtag and post search.',
      'Created role-based administration for users and reports, including story archives and highlights.',
      'Reached 60% unit and integration test coverage and automated Docker delivery to AWS EC2 through GitHub Actions and Amazon ECR.',
    ],
    tech: [
      'ASP.NET Core',
      'React',
      'Tailwind CSS',
      'PostgreSQL',
      'SignalR',
      'AWS S3',
      'Docker',
      'GitHub Actions',
    ],
    repo: 'https://github.com/qbael/Instory',
  },
  {
    id: 'project-smartdoc',
    name: 'SmartDoc AI',
    title: 'SmartDoc AI — Intelligent Document Q&A',
    filename: 'smartdoc.py',
    dates: 'Mar–May 2026',
    summary:
      'An intelligent document Q&A system combining standard RAG and Corrective RAG with hybrid retrieval and local language-model inference.',
    built: [
      'Ran standard RAG and Corrective RAG in parallel, used a CrossEncoder to evaluate context quality, rewrote weak queries, and used web search as a fallback.',
      'Combined FAISS semantic search and BM25 keyword search with Reciprocal Rank Fusion, multiple file types, and EasyOCR support.',
      'Supported local Ollama inference and a Google Colab plus ngrok path for GPU-accelerated inference.',
      'Streamed uploads and answers with SSE, stored conversational history in SQLite, and surfaced self-evaluated confidence scores.',
    ],
    tech: [
      'FastAPI',
      'React',
      'LangChain',
      'FAISS',
      'BM25',
      'Ollama',
      'EasyOCR',
      'SQLite',
      'Tavily',
    ],
    repo: 'https://github.com/qbael/SmartDoc-AI',
  },
  {
    id: 'project-medify',
    name: 'Medify',
    title: 'Medify — Medical Appointment Scheduling',
    filename: 'Medify.java',
    dates: 'Oct–Dec 2025',
    summary:
      'A full-stack appointment platform with real-time availability, multi-provider support, and flexible deployment.',
    built: [
      'Designed a scalable microservices architecture with Spring Cloud API Gateway for centralized routing and load balancing.',
      'Supported personal clinics, multiple providers, appointment management, and scheduling-conflict prevention.',
      'Built a patient-facing experience for booking and managing appointments.',
      'Prepared the system for on-premises or cloud deployment with multi-tenant support.',
    ],
    tech: [
      'Next.js',
      'Tailwind CSS',
      'Spring Boot',
      'PostgreSQL',
      'Docker',
      'Kubernetes',
    ],
    repo: 'https://github.com/qbael/Medify',
  },
  {
    id: 'project-phone-store',
    name: 'Phone Store',
    title: 'Phone Store Management System',
    filename: 'phone-store.php',
    dates: '2025',
    summary:
      'A practical system for managing inventory, sales, orders, customers, and reporting in a phone store.',
    built: [
      'Built stock tracking, product inventory, and automated low-stock alerts.',
      'Implemented sales processing, invoice generation, and customer purchase history.',
      'Created a reporting dashboard for sales analytics and performance metrics.',
      'Used a focused monolithic architecture to keep delivery and operation straightforward.',
    ],
    tech: ['React', 'Tailwind CSS', 'PHP', 'MySQL', 'Docker'],
    repo: 'https://github.com/qbael/PhoneStore',
  },
  {
    id: 'project-school-bus',
    name: 'School Bus',
    title: 'School Bus Tracking System',
    filename: 'school-bus.ts',
    dates: '2025',
    summary:
      'A real-time school transportation system for live bus locations, routes, notifications, and pickup planning.',
    built: [
      'Streamed bus locations through WebSocket for timely tracking updates.',
      'Visualized routes and pickup or drop-off points with the Mapbox API.',
      'Built notifications for parents and school administrators.',
      'Added route management and scheduling to improve transportation safety and communication.',
    ],
    tech: [
      'Next.js',
      'Tailwind CSS',
      'Node.js',
      'Express',
      'PostgreSQL',
      'WebSocket',
      'Mapbox API',
    ],
    repo: 'https://github.com/qbael/School-Bus-Management-System',
  },
  {
    id: 'project-sport-store',
    name: 'Sport Store',
    title: 'Sport Store Management System',
    filename: 'sport-store.sql',
    dates: '2024',
    summary:
      'A retail management system covering products, inventory, sales, customers, loyalty, and business reporting.',
    built: [
      'Used a Spring Boot monolith to keep development fast and the operating model straightforward.',
      'Built product categorization, inventory tracking, and stock alerts.',
      'Implemented sales and order-lifecycle management.',
      'Added customer relationship and loyalty tracking.',
      'Created reporting and analytics views for day-to-day business insight.',
    ],
    tech: ['React', 'Tailwind CSS', 'Spring Boot', 'MySQL'],
    repo: 'https://github.com/qbael/SportStore',
  },
] as const;

const skillGroups = [
  {
    name: 'Languages',
    skills: ['Java', 'C#', 'JavaScript', 'TypeScript', 'Python', 'PHP'],
  },
  {
    name: 'Frontend',
    skills: ['React', 'Next.js', 'Tailwind CSS', 'Vite'],
  },
  {
    name: 'Mobile Development',
    skills: ['React Native', 'Flutter'],
  },
  {
    name: 'Backend Frameworks',
    skills: ['Spring Boot', '.NET', 'Node.js', 'Express.js', 'FastAPI'],
  },
  {
    name: 'Architecture & Protocols',
    skills: ['REST APIs', 'Microservices', 'WebSocket', 'SignalR', 'JWT'],
  },
  {
    name: 'Data & Messaging',
    skills: ['PostgreSQL', 'MySQL', 'Supabase', 'Kafka'],
  },
  {
    name: 'DevOps & Cloud',
    skills: ['Docker', 'Kubernetes', 'AWS', 'GitHub Actions', 'Linux'],
  },
  {
    name: 'Tools & Testing',
    skills: ['Git', 'Jest', 'Postman', 'VS Code', 'IntelliJ IDEA'],
  },
] as const;

type SectionFileId = (typeof sectionFiles)[number]['id'];
type ProjectFileId = (typeof projects)[number]['id'];
type FileId = SectionFileId | ProjectFileId;

const validFiles = [
  ...sectionFiles.map((file) => file.id),
  ...projects.map((project) => project.id),
] as FileId[];

function fileMeta(id: FileId) {
  const section = sectionFiles.find((file) => file.id === id);
  if (section) return section;
  const project = projects.find((item) => item.id === id)!;
  return { id: project.id, label: project.name, filename: project.filename };
}

function isProject(id: FileId): id is ProjectFileId {
  return id.startsWith('project-');
}

function ProfileAvatar() {
  const [available, setAvailable] = useState(true);
  return available ? (
    <Image
      className="profile-avatar"
      src="/avatar.jpeg"
      alt=""
      width="128"
      height="128"
      priority
      onError={() => setAvailable(false)}
    />
  ) : (
    <div className="profile-avatar avatar-fallback" aria-hidden="true">
      QB
    </div>
  );
}

function SectionHeader({
  path,
  title,
  lead,
  id,
}: {
  path: string;
  title: string;
  lead: string;
  id: FileId;
}) {
  return (
    <header className="section-header">
      <p className="file-path">portfolio / {path}</p>
      <h1 id={`heading-${id}`} tabIndex={-1}>
        {title}
      </h1>
      <p className="section-lead">{lead}</p>
    </header>
  );
}

function AboutFile({
  openFile,
}: {
  openFile: (id: FileId, origin: NavigationOrigin) => void;
}) {
  const links = [
    {
      label: 'View GitHub',
      href: 'https://github.com/qbael',
      icon: FaGithub,
      variant: 'github',
    },
    {
      label: 'Open LinkedIn',
      href: 'https://www.linkedin.com/in/ho-quoc-bao-76a759295/',
      icon: FaLinkedin,
      variant: 'linkedin',
    },
    {
      label: 'Email Bao',
      href: 'mailto:baohoo10205@gmail.com',
      icon: FaEnvelope,
      variant: 'email',
    },
    {
      label: 'Open Facebook',
      href: 'https://www.facebook.com/baohoo10205/',
      icon: FaFacebook,
      variant: 'facebook',
    },
  ];

  return (
    <>
      <p className="file-path">portfolio / about.tsx</p>
      <article className="profile-card">
        <ProfileAvatar />
        <div className="profile-copy">
          <p className="eyebrow">Hello, I’m</p>
          <h1 id="heading-about" tabIndex={-1}>
            Ho Quoc Bao
          </h1>
          <p className="role">Software Engineer · Ho Chi Minh City, Vietnam</p>
          <p className="tagline">Building efficient solutions that matter.</p>
          <p className="lead">
            I’m a software engineer based in Ho Chi Minh City, focused on
            building practical products across web, mobile, and AI. I enjoy
            turning complex problems into clear, maintainable solutions while
            continuously improving my craft.
          </p>
          <blockquote className="philosophy">
            “Code is more than a tool; it is a form of art. Every line is an
            opportunity to create something beautiful, effective, and
            sustainable.”
          </blockquote>
          <div className="actions" aria-label="Profile links">
            {links.map(({ label, href, icon: Icon, variant }) => (
              <a
                className={`action action-${variant}`}
                href={href}
                key={label}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
              >
                <Icon aria-hidden="true" className="action-icon" size={16} />
                {label}
              </a>
            ))}
            <a
              className="action action-primary action-cv"
              href="/Ho-Quoc-Bao-Resume.pdf"
              target="_blank"
              rel="noreferrer"
            >
              <FaFilePdf aria-hidden="true" className="action-icon" size={15} />
              View CV
            </a>
          </div>
        </div>
      </article>

      <section className="shortcut-section" aria-labelledby="shortcuts-title">
        <div>
          <p className="eyebrow">Quick open</p>
          <h2 id="shortcuts-title">Explore my work</h2>
        </div>
        <div className="shortcut-grid">
          {[
            {
              id: 'experience',
              label: 'Work Experience',
              description: 'The role and outcomes behind my recent work.',
              icon: Briefcase,
            },
            {
              id: 'projects',
              label: 'Projects',
              description:
                'Six full-stack products and engineering case studies.',
              icon: FolderGit2,
            },
            {
              id: 'skills',
              label: 'Skills',
              description: 'The languages, frameworks, and tools I build with.',
              icon: Cpu,
            },
          ].map(({ id, label, description, icon: Icon }) => (
            <button
              className="shortcut"
              key={id}
              onClick={() => openFile(id as FileId, 'shortcut')}
            >
              <div className="shortcut-header">
                <div className="shortcut-icon-badge">
                  <Icon aria-hidden="true" size={18} />
                </div>
                <strong aria-hidden="true" className="shortcut-arrow">
                  Open{' '}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="arrow-icon"
                    size={14}
                  />
                </strong>
              </div>
              <span className="shortcut-title">{label}</span>
              <small className="shortcut-desc">{description}</small>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function EducationFile() {
  return (
    <>
      <SectionHeader
        id="education"
        path={fileMeta('education').filename}
        title="Education"
        lead="A focused foundation in software engineering and information technology."
      />
      <article className="detail-card education-card">
        <div className="card-heading">
          <span className="line-number">01</span>
          <div>
            <p className="card-meta">2023–Present</p>
            <h2>Sai Gon University</h2>
            <p>Information Technology</p>
          </div>
        </div>
        <div className="stat-grid">
          <div>
            <strong>3.65</strong>
            <span>GPA / 4.0</span>
          </div>
          <div>
            <strong>8.67</strong>
            <span>GPA / 10</span>
          </div>
          <div>
            <strong>06</strong>
            <span>Academic scholarships</span>
          </div>
        </div>
      </article>
    </>
  );
}

function AchievementsFile() {
  return (
    <>
      <SectionHeader
        id="achievements"
        path={fileMeta('achievements').filename}
        title="Achievements & Awards"
        lead="Recognition earned through consistent academic performance."
      />
      <article className="detail-card award-card">
        <span className="award-count" aria-hidden="true">
          06
        </span>
        <div>
          <p className="card-meta">Academic recognition</p>
          <h2>Six academic scholarships</h2>
          <p className="body-copy">
            Six academic scholarships received to date while pursuing
            Information Technology at Sai Gon University.
          </p>
        </div>
      </article>
    </>
  );
}

function ExperienceFile() {
  return (
    <>
      <SectionHeader
        id="experience"
        path={fileMeta('experience').filename}
        title="Work Experience"
        lead="Applied product engineering across mobile, music notation, data, and quality."
      />
      <article className="detail-card experience-card">
        <div className="experience-topline">
          <div>
            <p className="card-meta">Jun–Sep 2026</p>
            <h2>Software Developer Intern</h2>
            <p>FWD Vietnam Technology (FWD VTC)</p>
          </div>
          <span className="status-chip">
            <i aria-hidden="true" /> Internship
          </span>
        </div>
        <ul className="work-list">
          <li>
            Selected React Native and TypeScript for a mobile piano-learning
            application, then structured modular MIDI processing, playback, and
            scoring.
          </li>
          <li>
            Built a MIDI-to-MusicXML pipeline that handled measures, chords,
            rests, and ties for rendering with OpenSheetMusicDisplay.
          </li>
          <li>
            Reduced reloads and visual flicker by separating static notation
            from playback and feedback rendering.
          </li>
          <li>
            Implemented Supabase authentication, PostgreSQL Row Level Security,
            offline practice-history sync, and validation with Jest, TypeScript,
            and Android builds.
          </li>
        </ul>
      </article>
    </>
  );
}

function ProjectsFile({
  openFile,
}: {
  openFile: (id: FileId, origin: NavigationOrigin) => void;
}) {
  return (
    <>
      <SectionHeader
        id="projects"
        path={fileMeta('projects').filename}
        title="Selected Projects"
        lead="Six products spanning social platforms, AI, healthcare, real-time tracking, and retail operations."
      />
      <div className="projects-grid">
        {projects.map((project, index) => (
          <article className="project-card" key={project.id}>
            <div className="project-index">
              {String(index + 1).padStart(2, '0')}
            </div>
            <p className="card-meta">{project.dates}</p>
            <h2>{project.name}</h2>
            <p>{project.summary}</p>
            <button
              aria-label={`Open ${project.name} case study`}
              onClick={() => openFile(project.id, 'shortcut')}
            >
              Open case study <span aria-hidden="true">↗</span>
            </button>
          </article>
        ))}
      </div>
    </>
  );
}

function ProjectFile({ project }: { project: (typeof projects)[number] }) {
  return (
    <>
      <SectionHeader
        id={project.id}
        path={`projects / ${project.filename}`}
        title={project.title}
        lead={project.summary}
      />
      <article className="case-study">
        <div className="case-meta">
          <div>
            <span>Timeline</span>
            <strong>{project.dates}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>Completed</strong>
          </div>
        </div>
        <section>
          <p className="section-label">What I built</p>
          <ul className="work-list">
            {project.built.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <p className="section-label">Technologies & tools</p>
          <ul className="tag-list" aria-label={`${project.name} technologies`}>
            {project.tech.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <p className="section-label">Interface preview</p>
          <div className="screenshot-placeholder">
            <div className="placeholder-icon" aria-hidden="true">
              <Code2 size={26} />
            </div>
            <strong>Screenshot coming soon</strong>
            <span>A real product image will appear here when supplied.</span>
          </div>
        </section>
        <a
          className="action action-primary repo-action"
          href={project.repo}
          target="_blank"
          rel="noreferrer"
        >
          View GitHub repository <ExternalLink aria-hidden="true" size={16} />
        </a>
      </article>
    </>
  );
}

function SkillsFile() {
  return (
    <>
      <SectionHeader
        id="skills"
        path={fileMeta('skills').filename}
        title="Skills & Tech Stack"
        lead="The technologies I use to shape maintainable products from interface to infrastructure."
      />
      <div className="skills-grid">
        {skillGroups.map((group, index) => (
          <section className="skill-card" key={group.name}>
            <div className="skill-heading">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h2>{group.name}</h2>
            </div>
            <ul className="tag-list">
              {group.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

type VisitState =
  | { status: 'loading' }
  | { status: 'loaded'; total: number }
  | { status: 'unavailable' };

function VisitorsFile({
  visits,
  active,
}: {
  visits: VisitState;
  active: boolean;
}) {
  const announce = active && visits.status !== 'loading';
  return (
    <>
      <SectionHeader
        id="visitors"
        path={fileMeta('visitors').filename}
        title="Visitor Statistics"
        lead="A simple, privacy-respecting count of portfolio visits."
      />
      <article className="visitor-card">
        <p className="card-meta">Total visits</p>
        {visits.status === 'loading' && (
          <>
            <div className="visitor-skeleton" aria-hidden="true" />
            <p>Loading the current total…</p>
          </>
        )}
        {visits.status === 'loaded' && (
          <>
            <strong className="visitor-number" aria-hidden="true">
              {visits.total.toLocaleString('en-US')}
            </strong>
            <p
              className="sr-only"
              role={announce ? 'status' : undefined}
              aria-live={announce ? 'polite' : undefined}
              aria-atomic={announce ? 'true' : undefined}
            >
              Total visits: {visits.total.toLocaleString('en-US')}.
            </p>
            <p>
              Repeat loads in one GoatCounter session are grouped; totals may
              lag.
            </p>
          </>
        )}
        {visits.status === 'unavailable' && (
          <>
            <strong className="visitor-unavailable" aria-hidden="true">
              Unavailable
            </strong>
            <p
              className="sr-only"
              role={announce ? 'status' : undefined}
              aria-live={announce ? 'polite' : undefined}
              aria-atomic={announce ? 'true' : undefined}
            >
              Visit count unavailable.
            </p>
            <p>
              The visit count is temporarily unavailable. The rest of the
              portfolio is unaffected.
            </p>
          </>
        )}
        <div className="privacy-note">
          <i aria-hidden="true" /> GoatCounter stores aggregate statistics, not
          IP addresses or personal visitor records.
        </div>
      </article>
    </>
  );
}

function Explorer({
  active,
  projectsExpanded,
  setProjectsExpanded,
  origin,
  openFile,
}: {
  active: FileId;
  projectsExpanded: boolean;
  setProjectsExpanded: (value: boolean) => void;
  origin: 'explorer' | 'drawer';
  openFile: (id: FileId, origin: NavigationOrigin) => void;
}) {
  const link = (file: (typeof sectionFiles)[number]) => (
    <a
      className="file-link"
      href={`?file=${file.id}`}
      aria-current={active === file.id ? 'page' : undefined}
      onClick={(event) => {
        if (!shouldHandleNavigation(event)) return;
        event.preventDefault();
        openFile(file.id, origin);
      }}
    >
      <FileGlyph filename={file.filename} size={15} />
      <span>{file.filename}</span>
    </a>
  );

  return (
    <nav aria-label="Portfolio files">
      <p className="explorer-title">Project</p>
      <ul className="file-list">
        {sectionFiles.map((file) => (
          <li key={file.id}>
            {file.id === 'projects' ? (
              <>
                <div className="project-file-row">
                  {link(file)}
                  <button
                    className="disclosure"
                    aria-label={`${projectsExpanded ? 'Collapse' : 'Expand'} project files`}
                    aria-expanded={projectsExpanded}
                    aria-controls={`${origin}-project-files`}
                    onClick={() => setProjectsExpanded(!projectsExpanded)}
                  >
                    <span aria-hidden="true">›</span>
                  </button>
                </div>
                {projectsExpanded && (
                  <ul className="nested-files" id={`${origin}-project-files`}>
                    {projects.map((project) => (
                      <li key={project.id}>
                        <a
                          className="file-link project-link"
                          href={`?file=${project.id}`}
                          aria-current={
                            active === project.id ? 'page' : undefined
                          }
                          onClick={(event) => {
                            if (!shouldHandleNavigation(event)) return;
                            event.preventDefault();
                            openFile(project.id, origin);
                          }}
                        >
                          <FileGlyph filename={project.filename} size={14} />
                          <span>{project.filename}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              link(file)
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Surface({
  id,
  active,
  openFile,
  visits,
}: {
  id: FileId;
  active: boolean;
  openFile: (id: FileId, origin: NavigationOrigin) => void;
  visits: VisitState;
}) {
  if (isProject(id)) {
    return (
      <ProjectFile project={projects.find((project) => project.id === id)!} />
    );
  }
  switch (id) {
    case 'education':
      return <EducationFile />;
    case 'achievements':
      return <AchievementsFile />;
    case 'experience':
      return <ExperienceFile />;
    case 'projects':
      return <ProjectsFile openFile={openFile} />;
    case 'skills':
      return <SkillsFile />;
    case 'visitors':
      return <VisitorsFile visits={visits} active={active} />;
    default:
      return <AboutFile openFile={openFile} />;
  }
}

export default function Home() {
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState<FileId>>({
    tabs: ['about'],
    active: 'about',
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [visits, setVisits] = useState<VisitState>({ status: 'loading' });
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);
  const pendingDrawerHeading = useRef<FileId | null>(null);
  const { tabs: openTabs, active } = workspaceState;

  const setDocumentTitle = (id: FileId) => {
    document.title = `${fileMeta(id).label} — Ho Quoc Bao`;
  };

  const focusHeading = (id: FileId) => {
    window.setTimeout(
      () => document.getElementById(`heading-${id}`)?.focus(),
      0,
    );
  };

  const updateLocation = (id: FileId, replace = false) =>
    tryNavigation(() => {
      const url = new URL(window.location.href);
      if (url.searchParams.get('file') === id) return;
      url.searchParams.set('file', id);
      window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
    });

  const openFile = (id: FileId, origin: NavigationOrigin) => {
    if (!updateLocation(id)) return;
    setWorkspaceState((workspace) => openTab(workspace, id));
    if (isProject(id)) setProjectsExpanded(true);
    if (origin === 'drawer') {
      pendingDrawerHeading.current = id;
      setDrawerOpen(false);
    }
    setDocumentTitle(id);
    if (origin !== 'drawer' && shouldFocusHeading(origin)) focusHeading(id);
  };

  const closeFile = (id: FileId) => {
    const result = closeTab(workspaceState, id, 'about');
    if (result.active !== active && !updateLocation(result.active, true))
      return;
    setWorkspaceState({ tabs: result.tabs, active: result.active });
    if (result.active !== active) {
      setDocumentTitle(result.active);
    }
    window.requestAnimationFrame(() =>
      document.getElementById(`tab-${result.focus}`)?.focus(),
    );
  };

  useEffect(() => {
    const applyLocation = (origin: 'initial' | 'history') => {
      const requested = new URLSearchParams(window.location.search).get('file');
      const id = resolveFile(requested, validFiles, 'about');
      const focusedPanel =
        origin === 'history' &&
        Boolean(document.activeElement?.closest('[role="tabpanel"]'));
      setWorkspaceState((workspace) => openTab(workspace, id));
      if (isProject(id)) setProjectsExpanded(true);
      setDocumentTitle(id);
      if (requested !== null && requested !== id) updateLocation('about', true);
      if (focusedPanel) focusHeading(id);
    };

    applyLocation('initial');
    const onPopState = () => applyLocation('history');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchVisitCount()
      .then((total) => {
        if (!cancelled) setVisits({ status: 'loaded', total });
      })
      .catch(() => {
        if (!cancelled) setVisits({ status: 'unavailable' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="workspace">
        <aside className="explorer">
          <Explorer
            active={active}
            projectsExpanded={projectsExpanded}
            setProjectsExpanded={setProjectsExpanded}
            origin="explorer"
            openFile={openFile}
          />
        </aside>

        <main className="main-column" id="main-content" tabIndex={-1}>
          <Tabs
            className="portfolio-tabs"
            value={active}
            onValueChange={(value) => openFile(value as FileId, 'tab')}
          >
            <div className="workspace-toolbar">
              <Drawer
                open={drawerOpen}
                onOpenChange={(open) => {
                  if (open) pendingDrawerHeading.current = null;
                  setDrawerOpen(open);
                }}
                swipeDirection="left"
              >
                <DrawerTrigger ref={drawerTriggerRef} className="mobile-menu">
                  <Menu aria-hidden="true" size={17} /> Files
                </DrawerTrigger>
                <DrawerContent
                  className="drawer-panel"
                  initialFocus={drawerCloseRef}
                  finalFocus={() =>
                    resolveDrawerFocus(
                      pendingDrawerHeading.current,
                      (id) => document.getElementById(`heading-${id}`),
                      drawerTriggerRef.current ?? true,
                    )
                  }
                >
                  <div className="drawer-top">
                    <div>
                      <DrawerTitle>Portfolio files</DrawerTitle>
                      <DrawerDescription>
                        Choose a section to open.
                      </DrawerDescription>
                    </div>
                    <DrawerClose
                      ref={drawerCloseRef}
                      className="drawer-close"
                      aria-label="Close files"
                    >
                      <X aria-hidden="true" size={18} />
                    </DrawerClose>
                  </div>
                  <div className="drawer-nav">
                    <Explorer
                      active={active}
                      projectsExpanded={projectsExpanded}
                      setProjectsExpanded={setProjectsExpanded}
                      origin="drawer"
                      openFile={openFile}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
              <TabsList className="tab-strip" aria-label="Open files">
                {openTabs.map((id) => {
                  const meta = fileMeta(id);
                  return (
                    <div className="tab-item" key={id}>
                      <TabsTrigger
                        className="tab-button"
                        value={id}
                        id={`tab-${id}`}
                        aria-controls={`panel-${id}`}
                        onFocus={(event) =>
                          event.currentTarget.scrollIntoView({
                            block: 'nearest',
                            inline: 'nearest',
                            behavior: window.matchMedia(
                              '(prefers-reduced-motion: reduce)',
                            ).matches
                              ? 'auto'
                              : 'smooth',
                          })
                        }
                      >
                        <FileGlyph filename={meta.filename} size={14} />
                        {meta.filename}
                      </TabsTrigger>
                      <button
                        className="tab-close"
                        aria-label={`Close ${meta.label}`}
                        onClick={() => closeFile(id)}
                      >
                        <X aria-hidden="true" size={14} />
                      </button>
                    </div>
                  );
                })}
              </TabsList>
            </div>

            {openTabs.map((id) => (
              <TabsContent
                className="editor"
                value={id}
                id={`panel-${id}`}
                aria-labelledby={`tab-${id}`}
                key={id}
              >
                <div className="editor-inner">
                  <Surface
                    id={id}
                    active={active === id}
                    openFile={openFile}
                    visits={visits}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
          <footer className="statusbar">
            <span>One Dark Pro Darker</span>
            <span>
              {openTabs.length} open {openTabs.length === 1 ? 'file' : 'files'}{' '}
              · English · UTF-8
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
