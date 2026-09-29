export type CourseCatalogEntry = {
  slug: string;
  title: string;
  category: string;
  imageQuery: string;
};

export const COURSE_CATALOG: CourseCatalogEntry[] = [
  { slug: "python", title: "Python", category: "Programming", imageQuery: "python programming" },
  { slug: "java", title: "Java", category: "Programming", imageQuery: "java programming" },
  { slug: "cpp", title: "C++", category: "Programming", imageQuery: "c++ programming" },
  { slug: "oop", title: "Object-Oriented Programming", category: "Programming", imageQuery: "object oriented programming" },
  { slug: "data-structures", title: "Data Structures", category: "Core CS", imageQuery: "data structures" },
  { slug: "algorithms", title: "Algorithms", category: "Core CS", imageQuery: "algorithms computer science" },
  { slug: "dbms", title: "DBMS", category: "Core CS", imageQuery: "database management system" },
  { slug: "operating-systems", title: "Operating Systems", category: "Core CS", imageQuery: "operating systems" },
  { slug: "computer-networks", title: "Computer Networks", category: "Core CS", imageQuery: "computer networks" },
  { slug: "computer-architecture", title: "Computer Architecture", category: "Core CS", imageQuery: "computer architecture" },
  { slug: "discrete-mathematics", title: "Discrete Mathematics", category: "Mathematics", imageQuery: "discrete mathematics" },
  { slug: "theory-of-computation", title: "Theory of Computation", category: "Theory", imageQuery: "theory of computation" },
  { slug: "compiler-design", title: "Compiler Design", category: "Systems", imageQuery: "compiler design" },
  { slug: "sql", title: "SQL", category: "Databases", imageQuery: "sql database" },
  { slug: "mysql", title: "MySQL", category: "Databases", imageQuery: "mysql database" },
  { slug: "mongodb", title: "MongoDB", category: "Databases", imageQuery: "mongodb database" },
  { slug: "html-css", title: "HTML & CSS", category: "Web Development", imageQuery: "html css web development" },
  { slug: "javascript", title: "JavaScript", category: "Web Development", imageQuery: "javascript programming" },
  { slug: "react", title: "React", category: "Web Development", imageQuery: "react javascript" },
  { slug: "nodejs", title: "Node.js", category: "Web Development", imageQuery: "node.js backend" },
  { slug: "rest-apis", title: "REST APIs", category: "Web Development", imageQuery: "rest api" },
  { slug: "system-design", title: "System Design Basics", category: "Architecture", imageQuery: "system design architecture" },
  { slug: "software-engineering", title: "Software Engineering", category: "Engineering", imageQuery: "software engineering" },
  { slug: "devops", title: "DevOps Basics", category: "DevOps", imageQuery: "devops deployment" },
  { slug: "cybersecurity", title: "Cybersecurity Basics", category: "Security", imageQuery: "cybersecurity" },
  { slug: "cloud-computing", title: "Cloud Computing Basics", category: "Cloud", imageQuery: "cloud computing" },
  { slug: "machine-learning", title: "Machine Learning Basics", category: "AI & Data", imageQuery: "machine learning" },
  { slug: "artificial-intelligence", title: "Artificial Intelligence", category: "AI & Data", imageQuery: "artificial intelligence" },
  { slug: "data-science", title: "Data Science", category: "AI & Data", imageQuery: "data science" },
  { slug: "computer-graphics", title: "Computer Graphics", category: "Core CS", imageQuery: "computer graphics" },
  { slug: "mobile-development", title: "Mobile Development", category: "Development", imageQuery: "mobile app development" },
];