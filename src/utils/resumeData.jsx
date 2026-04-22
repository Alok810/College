export const SECTION_LABELS = {
  summary: "Summary",
  education: "Education",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  publications: "Publications",
  honors: "Selected Honors",
  patents: "Patents",
  extracurriculars: "Extra-Curriculars",
  talks: "Invited Talks"
};

// 🔥 1. ALOK'S ACADEMIC DATA (INDIAN STUDENT CONTEXT) 🔥
export const ALOK_DUMMY_DATA = {
  template: "alok",
  headerAlignment: "text-center",
  showLines: true,
  nameSize: "text-[32px]",
  sectionTitleSize: 16,
  textSize: 14,
  bodyColor: "#000000",
  nameColor: "#0f172a",
  headlineColor: "#0f172a",
  connectionsColor: "#374151",
  sectionColor: "#0f172a",
  linkColor: "#374151",
  footerColor: "#808080",
  topNoteColor: "#808080",
  marginTop: 38,
  marginBottom: 38,
  marginLeft: 45,
  marginRight: 45,
  lineSpacing: 1.5,
  showFooter: false,
  showTopNote: false,
  
  sectionOrder: ["summary", "education", "skills", "experience", "projects", "honors", "extracurriculars", "publications", "patents", "talks"],
  customSections: [],
  // Hide advanced niche sections by default to keep the student resume clean
  hiddenSections: ["publications", "patents", "talks"],
  
  name: "ALOK KUMAR",
  academicStatus: "FINAL YEAR • B.TECH COMPUTER ENGINEERING",
  address: "JCB Hostel, NIFFT Colony Khunti Road, Hatia, Ranchi, Jharkhand 834003",
  profileImage: "",
  socialLinks: [
    { platform: "Phone", url: "+91 8102542277", text: "+91 8102542277" },
    { platform: "Email", url: "alokgond.in@gmail.com", text: "alokgond.in@gmail.com" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/alokkumar", text: "linkedin.com/in/alokkumar" },
    { platform: "GitHub", url: "https://github.com/alokkumar", text: "github.com/alokkumar" },
    { platform: "LeetCode", url: "https://leetcode.com/alokkumar", text: "leetcode.com/alokkumar" }
  ],
  summary: "Driven Computer Engineering student with a strong foundation in full-stack development and machine learning. Proven ability to build scalable applications and solve complex algorithmic challenges. Eager to leverage software engineering skills in a dynamic tech environment.",
  education: [
    { school: "National Institute of Advanced Manufacturing Technology (NIAMT)", year: "2022 – Present", degree: "Bachelor of Technology in Computer Engineering", grade: "<i>CGPA: 8.70/10.0</i>" },
    { school: "Laxmi Narain Dubey College, Motihari", year: "2019 – 2021", degree: "12th Grade (BSEB)", grade: "<i>Percentage: 88.4%</i>" }
  ],
  skills: "<b>Languages:</b> C, C++, Java, Python, JavaScript, SQL<br><b>Frameworks & Libraries:</b> React.js, Node.js, Express, Flask, Tailwind CSS<br><b>Tools & Platforms:</b> VS Code, Git, GitHub, Docker, Postman, MongoDB, Firebase",
  experience: [
    { company: "TWYN", location: "Noida, UP (Remote)", title: "Software Engineering Intern", dates: "March 2024 – June 2024", description: "<ul><li>Developed proficiency in Machine Learning, Deep Learning, and Natural Language Processing (NLP).</li><li>Worked on real-world industry datasets to optimize data pipelines and enhance model accuracy by 12%.</li><li>Collaborated with senior engineers to deploy predictive models via REST APIs.</li></ul>" }
  ],
  projects: [
    { name: "Web Dashboard - Cybersecurity Scanner", tech: "React, Node.js, OWASP ZAP", url: "", description: "<ul><li>Developed a real-time vulnerability scanner using OWASP ZAP with dynamic plugin progress charts.</li><li>Integrated HoneyDB for live honeypot monitoring and interactive attack source visualization.</li></ul>" },
    { name: "AISHA - AI-Powered Smart Assistant", tech: "Python, TensorFlow, NLP", url: "github.com", description: "<ul><li>Developed a voice-based AI assistant with real-time speech recognition and NLP-based contextual responses.</li><li>Integrated deep learning models for accurate intent classification and automated face detection.</li></ul>" }
  ],
  publications: [
    { title: "Real-time Vulnerability Detection in Web Applications using Machine Learning", date: "Nov 2023", authors: "<i>Alok Kumar</i>, Dr. R. Sharma", details: "Presented at IEEE National Conference on Cybersecurity (NCCS)" }
  ],
  honors: "<ul><li>Winner, Smart India Hackathon (Software Edition) - 2023</li><li>Ranked top 2% among 15,000+ participants in CodeChef National Coding Challenge</li><li>Institute Merit Scholarship for placing in the top 5 of the Computer Engineering department</li></ul>",
  patents: "<ol><li>Smart IoT-Based Honeypot Architecture for Local Network Security (Indian Provisional Patent App. 202341098765)</li></ol>",
  extracurriculars: [
    { organization: "Google Developer Student Clubs (GDSC)", dates: "Jan 2023 - Present", role: "Core Team Member", description: "Organized and hosted hands-on bootcamps on React.js and Web Security, training over 150+ students." },
    { organization: "Chess Club, NIAMT", dates: "Aug 2022 - Present", role: "Secretary", description: "Organized the inter-college chess tournament 'Checkmate 2023'. Represented the institute in state-level university games." }
  ],
  talks: "<ol><li>Getting Started with Web Security and OWASP ZAP &mdash; GDSC NIAMT Bootcamp (2024)</li><li>Building AI Assistants with Python &mdash; TechFest Symposium (2023)</li></ol>"
};

// 🔥 2. CLASSIC RENDERCV DATA (INDIAN SOFTWARE ENGINEER CONTEXT) 🔥
export const CLASSIC_DUMMY_DATA = {
  template: "classic",
  headerAlignment: "text-left",
  showLines: true,
  nameSize: "text-[40px]",
  sectionTitleSize: 18,
  textSize: 13,
  bodyColor: "#000000",
  nameColor: "#004f90",
  headlineColor: "#f92807",
  connectionsColor: "#004f90", 
  sectionColor: "#004f90",
  linkColor: "#004f90",
  footerColor: "#808080",
  topNoteColor: "#808080",
  marginTop: 67, 
  marginBottom: 67,
  marginLeft: 67,
  marginRight: 67,
  lineSpacing: 1.5,
  showFooter: true,
  showTopNote: true,
  
  sectionOrder: ["summary", "education", "experience", "projects", "skills", "publications", "honors", "patents", "extracurriculars", "talks"],
  customSections: [],
  hiddenSections: ["summary", "academicStatus", "publications", "honors", "patents", "extracurriculars", "talks"],
  
  name: "Rahul Verma",
  academicStatus: "Senior Software Engineer",
  address: "Koramangala, Bengaluru, Karnataka",
  profileImage: "", 
  socialLinks: [
    { platform: "Email", url: "rahul.verma@email.in", text: "rahul.verma@email.in" },
    { platform: "Portfolio/Website", url: "rahulverma.dev", text: "rahulverma.dev" },
    { platform: "LinkedIn", url: "linkedin.com/in/rahulverma", text: "rahulverma" },
    { platform: "GitHub", url: "github.com/rahulverma", text: "rahulverma", visible: false }
  ],
  summary: "Software Engineer with 4+ years of experience in building highly scalable distributed systems and microservices. Passionate about performance optimization, cloud-native architectures, and contributing to open-source communities in the Indian tech ecosystem.",
  education: [
    { school: "Indian Institute of Technology (IIT) Delhi", year: "July 2015 – May 2019", degree: "B.Tech in Computer Science and Engineering", grade: "<ul><li>CGPA: 9.1/10.0</li><li>Institute Silver Medalist for academic excellence</li></ul>" }
  ],
  skills: "<b>Languages:</b> Python, Go, Java, C++, TypeScript<br><b>Frameworks:</b> React, Spring Boot, Django, FastAPI<br><b>Infrastructure:</b> Kubernetes, Docker, AWS, Kafka, Redis, PostgreSQL<br><b>Domains:</b> Distributed Systems, Microservices, API Design, System Architecture",
  experience: [
    { company: "Atlassian", location: "Bengaluru, KA", title: "Senior Software Engineer", dates: "Jan 2022 – Present", description: "<ul><li>Redesigned the core notification service, migrating from a monolith to Go-based microservices, reducing latency by 40%.</li><li>Scaled Kafka event processing to handle 5M+ events per minute with 99.99% uptime.</li><li>Mentored 3 junior engineers and led the transition to Kubernetes-based deployments across the organization.</li></ul>" },
    { company: "Flipkart", location: "Bengaluru, KA", title: "Software Development Engineer II", dates: "June 2019 – Dec 2021", description: "<ul><li>Developed a high-throughput pricing engine capable of handling 10,000+ RPS during the Big Billion Days sale.</li><li>Implemented distributed Redis caching strategies that decreased primary database load by 60%.</li></ul>" }
  ],
  projects: [
    { name: "UPI Payment Simulator", tech: "Golang, React, PostgreSQL", url: "github.com", description: "Open-source sandbox for testing UPI-based payment workflows.<br><ul><li>Simulates bank node timeouts and network failures for robust integration testing.</li><li>Adopted by 15+ early-stage Indian fintech startups for testing gateway reliability.</li></ul>" }
  ],
  publications: [
    { title: "Optimizing Gossip Protocols in High-Latency Networks", date: "Dec 2020", authors: "<i>Rahul Verma</i>, Dr. S. K. Singh", details: "IEEE International Conference on Distributed Computing" }
  ],
  honors: "<ul><li>All India Rank (AIR) 214 in JEE Advanced (2015)</li><li>Winner, Smart India Hackathon (2018)</li></ul>",
  patents: "<ol><li>Method and System for Dynamic Load Balancing in E-commerce (IN Patent 456789)</li></ol>",
  extracurriculars: [
    { organization: "IIT Delhi Coding Club", dates: "2017 - 2019", role: "Secretary", description: "Organized competitive programming contests and conducted weekly algorithm workshops for 200+ students." }
  ],
  talks: "<ol><li>Scaling Go Services for Billions of Requests &mdash; GopherCon India (2023)</li></ol>"
};

// 🔥 3. MODERN TWO-COLUMN DATA (INDIAN FINANCE CONTEXT) 🔥
export const MODERN_DUMMY_DATA = {
  template: "modern",
  headerAlignment: "text-left",
  showLines: false,
  nameSize: "text-[32px]",
  sectionTitleSize: 16,
  textSize: 12,
  bodyColor: "#333333",
  nameColor: "#ffffff",
  headlineColor: "#e5e7eb", 
  connectionsColor: "#0b1e36", 
  sectionColor: "#0b1e36", 
  linkColor: "#000000",
  footerColor: "#808080",
  topNoteColor: "#808080",
  marginTop: 38,
  marginBottom: 38,
  marginLeft: 38,
  marginRight: 38,
  lineSpacing: 1.5,
  showFooter: false,
  showTopNote: false,
  
  sectionOrder: ["summary", "experience", "education", "projects", "skills", "honors", "patents", "publications", "extracurriculars", "talks"],
  customSections: [],
  hiddenSections: ["honors", "patents", "publications", "extracurriculars", "talks", "projects"],
  
  name: "VIKRAM SHARMA",
  academicStatus: "Senior Financial Analyst",
  address: "Bandra Kurla Complex, Mumbai, Maharashtra 400051",
  profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256", 
  socialLinks: [
    { platform: "Email", url: "vikram.sharma@email.in", text: "vikram.sharma@email.in" },
    { platform: "Phone", url: "+91 98765 43210", text: "+91 98765 43210" },
    { platform: "LinkedIn", url: "linkedin.com/in/vikramsharma", text: "linkedin.com/in/vikramsharma" }
  ],
  summary: "Experienced Financial Analyst with a strong background in managing multi-million rupee portfolios. Provides strategic analysis and accounting support within corporate finance. Proven track record of reducing operational expenses and developing highly accurate forecasting models for Indian markets.",
  experience: [
    { company: "HDFC Bank, Mumbai", title: "Senior Financial Analyst", dates: "Apr 2018 — Present", description: "<ul><li>Led a team of 5 analysts to restructure the annual corporate budget, reducing material costs by 15%.</li><li>Generated quarterly financial reports on completed investments with consistently positive yields.</li><li>Developed complex financial statements, cash flow charts, and dynamic balance sheets using Tableau and Excel.</li></ul>" },
    { company: "Reliance Retail, Mumbai", title: "Financial Analyst", dates: "Sep 2013 — Mar 2018", description: "<ul><li>Conducted cash flow analysis, drafted annual budgets, and presented monthly revenue projections to senior stakeholders.</li><li>Analyzed corporate vendor accounts and advised in negotiations resulting in ₹1.2 Cr in budget savings.</li><li>Coordinated key finance reports and presented results to executive management.</li></ul>" }
  ],
  education: [
    { school: "Indian Institute of Management Ahmedabad (IIMA)", degree: "Master of Business Administration (MBA)", year: "2011 — 2013", grade: "Graduated in the top 5% of the cohort. President of the Finance Club." },
    { school: "IIT Bombay", degree: "Bachelor of Technology in Mathematics", year: "2007 — 2011", grade: "CGPA: 9.2/10" }
  ],
  skills: "<ul><li>Financial Modeling</li><li>Strategic Planning</li><li>Data Visualization (Tableau)</li><li>Market Assessment</li><li>Corporate Valuation</li><li>Team Leadership</li></ul>",
  projects: [
    { name: "Automated Budget Forecasting Tool", tech: "Python, Excel Macros", url: "", description: "Developed an internal script that automated month-end forecasting, saving 20 hours of manual data entry per week." }
  ],
  publications: [
    { title: "Emerging Trends in Indian Fintech and Retail Banking", date: "Aug 2021", authors: "<i>Vikram Sharma</i>", details: "Journal of Finance India" }
  ],
  honors: "<ul><li>Employee of the Year - HDFC Bank Corporate Finance (2020)</li><li>Best Analytical Model - Reliance Retail Innovation Drive (2016)</li></ul>",
  patents: "<ol><li>Dynamic Financial Risk Assessment Algorithm (IN Patent 312456)</li></ol>",
  extracurriculars: [
    { organization: "Mumbai Finance Meetup", dates: "2019 - Present", role: "Co-Organizer", description: "Host monthly seminars for young finance professionals to network and discuss market trends." }
  ],
  talks: "<ol><li>The Future of Digital Banking in India &mdash; FinTech Summit Mumbai (2022)</li><li>Corporate Valuation Strategies &mdash; IIM Ahmedabad Guest Lecture (2021)</li></ol>"
};

// Start the builder with Alok's data by default
export const DEFAULT_DUMMY_DATA = ALOK_DUMMY_DATA;