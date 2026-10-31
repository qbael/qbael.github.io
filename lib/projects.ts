export const projects = [
  {
    id: 'project-findie',
    name: 'Findie',
    title: 'Findie — AI-assisted Lost & Found',
    filename: 'Findie.cs',
    dates: 'Oct 2026–Present',
    status: 'Local MVP',
    screenshots: [
      {
        src: '/projects/findie-home.jpg',
        label: 'Search by description or image, with location and date filters',
      },
      {
        src: '/projects/findie-search.jpg',
        label: 'Demo — search results with item photos and custody locations',
      },
      {
        src: '/projects/findie-item.jpg',
        label: 'Demo — item details and the ownership verification process',
      },
      {
        src: '/projects/findie-claim.jpg',
        label: 'Demo — review an ownership claim before opening a conversation',
      },
      {
        src: '/projects/findie-intake.jpg',
        label: 'Demo — confirm physical intake at a Findie Hub',
      },
    ],
    imageNote:
      'Screenshots of the actual application interface, populated with fictional demo items, claims and reception-hub records.',
    summary:
      'A lost-and-found platform connecting finders, owners and reception hubs through Vietnamese text and image search, ownership claims and traceable handovers.',
    problem:
      'Lost-item reports are scattered across social groups, and different descriptions can hide a match. Findie brings discovery and recovery into one workflow: search using what you remember, identify who holds the item, and follow the right return process.',
    capabilities:
      'Sign in with Google, post found items with photos and location details, search with a description or up to three images, submit an ownership claim, and message the holder after approval. Hub staff can record intake, custody changes and completed returns.',
    built: [
      'Built the React application and .NET business API around the complete posting-to-return workflow, including personal custody and reception-hub handovers.',
      'Implemented a Python worker for image normalization, sensitive-region masking, embeddings and multimodal search; required image review before publication.',
      'Combined vector similarity, full-text search and location signals for text retrieval, with visual embeddings for image search.',
      'Added access-controlled claims and conversations, idempotent writes, source-version checks, an indexing outbox and custody history.',
    ],
    architecture:
      'React → ASP.NET Core API → PostgreSQL for accounts and business records. RabbitMQ exchanges AI jobs and results with a Python worker, which maintains a separate PostgreSQL/pgvector search database. A private Cloudflare R2 bucket stores processed images; a GPU model gateway supplies Qwen embeddings and vision inference. FastAPI exposes internal health and operations endpoints.',
    tech: [
      'React',
      'TypeScript',
      'Vite',
      'Tailwind CSS',
      '.NET 10',
      'EF Core',
      'Google OAuth',
      'PostgreSQL',
      'pgvector',
      'RabbitMQ',
      'Python',
      'FastAPI',
      'OpenCV',
      'Qwen3-VL',
      'Cloudflare R2',
      'Docker Compose',
    ],
    repo: 'https://github.com/qbael/FindieHackathon',
  },
  {
    id: 'project-medify',
    name: 'Medify',
    title: 'Medify — Medical Appointment Scheduling',
    filename: 'Medify.java',
    dates: 'Oct–Dec 2025',
    status: 'Implemented',
    screenshots: [
      {
        src: '/projects/medify-home.jpg',
        label: 'Patient homepage and provider discovery',
      },
      {
        src: '/projects/medify-doctors.jpg',
        label: 'Demo — browse doctor profiles and specialties',
      },
      {
        src: '/projects/medify-booking.jpg',
        label: 'Doctor profile and available appointment slots',
      },
      {
        src: '/projects/medify-appointments.jpg',
        label: 'Demo — clinic appointment management and booking statuses',
      },
      {
        src: '/projects/medify-schedule.jpg',
        label: 'Demo — configure a doctor’s weekly working hours',
      },
    ],
    imageNote:
      'Screenshots of the actual application interface with fictional doctors, patients, appointments and weekly schedules. Implementation repository: HealthPro.',
    summary:
      'A medical appointment application connecting patients, doctors and clinics through provider discovery, available time slots and appointment management.',
    problem:
      'Patients often have to contact clinics individually, while doctors and clinics manage separate schedules. Medify brings provider discovery, availability and booking into one place, with dedicated tools for each role.',
    capabilities:
      'Patients can find doctors or clinics, filter by specialty, book an available slot and view appointments. Doctors manage their schedules, while clinics manage specialties, appointments and invitations for doctors to work with them.',
    built: [
      'Built patient-facing doctor and clinic discovery, specialty filters, provider profiles and booking from available dates and time slots.',
      'Implemented separate patient, doctor and clinic experiences with appointment lists and schedule management.',
      'Created schedule templates and generated slots for individual doctors and clinic specialties; booking records an appointment and consumes its selected slot.',
      'Connected the frontend to authentication, clinic and scheduling services through a JWT-protected API gateway, with Docker Compose and Kubernetes deployment definitions.',
    ],
    architecture:
      'A Next.js frontend calls Spring Cloud Gateway, which routes requests to authentication, clinic and scheduling microservices. Each service owns a PostgreSQL database and uses Spring Data JPA for persistence. Spring Security and JWT checks protect gateway routes; Docker Compose defines the local service stack.',
    tech: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Java 21',
      'Spring Boot',
      'Spring Cloud Gateway',
      'Spring Security',
      'Spring Data JPA',
      'PostgreSQL',
      'Docker',
      'Kubernetes manifests',
    ],
    repo: 'https://github.com/qbael/HealthPro',
  },
  {
    id: 'project-instory',
    name: 'Instory',
    title: 'Instory — Social Media Platform',
    filename: 'Instory.cs',
    dates: 'Mar–May 2026',
    status: 'Implemented',
    screenshots: [
      {
        src: '/projects/instory-feed.jpg',
        label: 'Social feed, stories and post interactions',
      },
      {
        src: '/projects/instory-chat.jpg',
        label: 'Direct and group messaging',
      },
      {
        src: '/projects/instory-admin.jpg',
        label: 'Community administration and moderation',
      },
      {
        src: '/projects/instory-profile.jpg',
        label: 'Demo — personal profile, story highlights and media gallery',
      },
      {
        src: '/projects/instory-trends.jpg',
        label: 'Demo — discover trending hashtags and community posts',
      },
    ],
    imageNote:
      'Screenshots of the actual application interface with fictional profiles, posts, conversations and moderation records.',
    summary:
      'A full-stack social platform for sharing posts and stories, discovering people and hashtags, and staying connected through live messaging and notifications.',
    problem:
      'A social product needs more than a feed: publishing, conversations, media, identity and moderation must work together. Instory brings these workflows into one application for both community members and administrators.',
    capabilities:
      'Users can publish media posts, react and comment, share stories, save highlights, send friend requests, discover users and hashtags, and chat privately or in groups. Administrators manage users, posts and community reports.',
    built: [
      'Implemented posts, likes, comments, sharing, profiles, friend requests, stories, archives and highlights, with media uploads to AWS S3.',
      'Built direct and group conversations, media messages and live notifications using SignalR.',
      'Added Google sign-in, email OTP verification, JWT authentication, refresh tokens and role-based administration.',
      'Created user and post search, hashtag discovery and trends, plus report-management tools.',
      'Added unit and integration tests with coverage collection in CI; configured GitHub Actions to build the frontend, push API images to Amazon ECR and deploy to EC2.',
    ],
    architecture:
      'A React/TypeScript SPA connects to an ASP.NET Core API organized into controllers, services, repositories and a unit of work. EF Core persists application records in PostgreSQL, AWS S3 stores uploaded media, and SignalR hubs deliver chat and notification events. Docker and GitHub Actions support backend delivery to AWS.',
    tech: [
      'React',
      'TypeScript',
      'Vite',
      'Redux Toolkit',
      'Tailwind CSS',
      '.NET 10',
      'ASP.NET Core',
      'EF Core',
      'PostgreSQL',
      'SignalR',
      'AWS S3',
      'Docker',
      'GitHub Actions',
      'Amazon ECR',
      'AWS EC2',
    ],
    repo: 'https://github.com/qbael/Instory',
    live: 'https://d3bxzivb46uej3.cloudfront.net/',
  },
  {
    id: 'project-smartdoc',
    name: 'SmartDoc AI',
    title: 'SmartDoc AI — Intelligent Document Q&A',
    filename: 'smartdoc.py',
    dates: 'Mar–May 2026',
    status: 'Implemented',
    screenshots: [
      {
        src: '/projects/smartdoc-answer.jpg',
        label: 'Document Q&A and streamed answers',
      },
      {
        src: '/projects/smartdoc-citations.jpg',
        label: 'File, page and excerpt citations',
      },
      {
        src: '/projects/smartdoc-documents.jpg',
        label: 'Document upload and indexing',
      },
    ],
    imageNote: 'Application interface with example documents and questions.',
    summary:
      'A document Q&A workspace that turns PDFs, Word files and scanned images into searchable knowledge, with answers linked to their source evidence.',
    problem:
      'Finding a detail across long documents takes time, and an AI answer is difficult to trust without its source. SmartDoc retrieves relevant passages and exposes citations so users can inspect the evidence behind an answer.',
    capabilities:
      'Upload multiple documents, extract text from scans, ask follow-up questions, inspect file/page/excerpt citations and revisit saved conversations. Compare standard RAG with Corrective RAG, which can rewrite weak queries and fall back to web search.',
    built: [
      'Implemented multi-file ingestion with OCR, document chunking, multilingual embeddings and source citations.',
      'Ran standard RAG and Corrective RAG side by side; evaluated context with a cross-encoder and rewrote weak queries before a web-search fallback.',
      'Combined FAISS semantic search and BM25 keyword matching using Reciprocal Rank Fusion.',
      'Streamed upload and query progress over SSE, persisted chat sessions in SQLite and supported Ollama inference locally or through Colab/ngrok.',
    ],
    architecture:
      'React/Vite → FastAPI REST and SSE endpoints → shared ingestion and retrieval pipelines. FAISS and BM25 hold local search indexes; SQLite stores conversations. LangChain coordinates retrieval and generation, Ollama serves the language model, and Tavily provides the corrective web-search fallback.',
    tech: [
      'React',
      'Vite',
      'Zustand',
      'Python',
      'FastAPI',
      'LangChain',
      'FAISS',
      'BM25',
      'sentence-transformers',
      'EasyOCR',
      'Ollama',
      'SQLite',
      'Tavily',
    ],
    repo: 'https://github.com/qbael/SmartDoc-AI',
  },
  {
    id: 'project-phone-store',
    name: 'Phone Store',
    title: 'Phone Store Management System',
    filename: 'phone-store.php',
    dates: '2025',
    status: 'Implemented',
    screenshots: [
      { src: '/projects/phone-store-home.jpg', label: 'Online storefront' },
      {
        src: '/projects/phone-store-products.jpg',
        label: 'Product and variant catalog',
      },
      {
        src: '/projects/phone-store-admin.jpg',
        label: 'Store management dashboard',
      },
    ],
    imageNote: 'Application interface with sample retail data.',
    summary:
      'A phone retail application connecting online shopping with store operations, keeping product variants, stock, purchasing, orders and warranty records in one system.',
    problem:
      'A phone store must keep online orders, physical stock and device warranties consistent. This project connects customer purchases with SKU inventory, supplier receipts and IMEI-linked warranty records.',
    capabilities:
      'Customers browse products, choose variants, check out and review order history. Staff manage stock, suppliers, purchasing, employee permissions and warranties, then inspect sales and import statistics.',
    built: [
      'Built product browsing, variant selection, cart, checkout and customer order history.',
      'Implemented SKU stock checks and transactional receipt creation, with stock restoration when eligible orders are cancelled.',
      'Added supplier purchasing, employee and role management, and IMEI-linked warranty records.',
      'Created chart views for sales, products, customers and purchasing statistics.',
    ],
    architecture:
      'A React/Vite SPA consumes a PHP JSON API organized into controllers, services and repositories. MySQL stores retail records, transactions coordinate order and stock updates, and JWT authenticates API requests.',
    tech: [
      'React',
      'Vite',
      'Bootstrap',
      'Axios',
      'PHP',
      'MySQL',
      'JWT',
      'Chart.js',
    ],
    repo: 'https://github.com/qbael/PhoneStore',
  },
  {
    id: 'project-school-bus',
    name: 'School Bus',
    title: 'School Bus Tracking System',
    filename: 'school-bus.ts',
    dates: '2025',
    status: 'Implemented',
    screenshots: [
      {
        src: '/projects/school-bus-dashboard-v2.jpg',
        label: 'Transport operations dashboard',
      },
      { src: '/projects/school-bus-schedules.jpg', label: 'Bus schedules' },
      {
        src: '/projects/school-bus-routes.jpg',
        label: 'Routes and pickup stops',
      },
    ],
    imageNote:
      'Application interface with sample transport data; location simulation is available for demos.',
    summary:
      'A school transport platform that helps administrators coordinate buses and routes while parents follow their child’s journey and receive pickup, arrival or absence updates.',
    problem:
      'Parents need to know where the bus is and whether their child has boarded, while schools need consistent route and student records. This system connects live locations with transport operations and student journey events.',
    capabilities:
      'Administrators assign buses, drivers, students and ordered stops to routes. Drivers share their location and record pickup or drop-off events. Parents view buses on a map and receive journey notifications.',
    built: [
      'Built separate administrator, driver and parent experiences with bus, student, stop, route and driver assignments.',
      'Streamed driver GPS locations over WebSocket and displayed buses and routes on Mapbox maps, with a location simulation mode for demos.',
      'Recorded student pickup, drop-off and absence events and created parent notifications.',
      'Added route and schedule management with ordered pickup stops.',
    ],
    architecture:
      'Next.js → Express REST API → controller, service and repository layers → Prisma/MySQL. A WebSocket server distributes current bus locations to map clients, while persisted student events support journey history and notifications.',
    tech: [
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Node.js',
      'Express',
      'Prisma',
      'MySQL',
      'WebSocket',
      'Mapbox',
    ],
    repo: 'https://github.com/qbael/School-Bus-Management-System',
  },
  {
    id: 'project-sport-store',
    name: 'Sport Store',
    title: 'Sport Store Management System',
    filename: 'sport-store.sql',
    dates: '2024',
    status: 'Implemented',
    screenshots: [
      {
        src: '/projects/sport-store-home.jpg',
        label: 'Sports retail storefront',
      },
      {
        src: '/projects/sport-store-products.jpg',
        label: 'Product variants and catalog',
      },
      {
        src: '/projects/sport-store-analytics.jpg',
        label: 'Business reports and analytics',
      },
    ],
    imageNote: 'Application interface with sample retail data.',
    summary:
      'A sports retail application combining an online storefront with inventory and back-office tools for product variants, purchasing, customer orders and business reporting.',
    problem:
      'Sports products come in many sizes, colors and brands, making stock and purchasing hard to coordinate. Sport Store tracks stock per variant and connects purchases, sales and reports in one workflow.',
    capabilities:
      'Customers browse products and place orders. Staff organize products by sport, brand, size and color, receive supplier stock, manage invoices and permissions, and export business reports as PDFs.',
    built: [
      'Built catalog browsing, product details, cart, order placement and customer accounts.',
      'Managed products by category, sport, brand, color and size, with inventory held per variant.',
      'Implemented supplier purchasing and invoice workflows, including stock deduction on sale and restoration on cancellation.',
      'Added customer, employee and permission management, plus revenue, profit, product, customer and import reports with PDF export.',
    ],
    architecture:
      'A React/TypeScript Vite SPA calls a Spring Boot REST monolith. Service and repository layers use Spring Data JPA with MySQL; Chart.js presents statistics and iText generates PDF reports.',
    tech: [
      'React',
      'TypeScript',
      'Vite',
      'Tailwind CSS',
      'Bootstrap',
      'Java 21',
      'Spring Boot',
      'Spring Data JPA',
      'MySQL',
      'Chart.js',
      'iText',
    ],
    repo: 'https://github.com/qbael/SportStore',
  },
] as const;
