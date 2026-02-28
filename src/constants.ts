export const COURSES = [
  {
    name: "BCA",
    subjects: [
      "C Programming",
      "Digital Logic and Computer Design",
      "Accountancy",
      "Indian Constitutional Values",
      "Mathematics",
      "Discrete Structures",
      "Data Structures",
      "Operating Systems",
      "Computer Networks",
      "Software Engineering",
      "Database Management Systems",
      "Java Programming",
      "Python Programming",
      "Web Technologies",
    ],
  },
  {
    name: "BCom",
    subjects: [
      "Financial Accounting",
      "Business Management",
      "Corporate Accounting",
      "Business Law",
      "Economics",
      "Auditing",
      "Cost Accounting",
      "Income Tax",
      "Marketing Management",
      "Banking and Insurance",
    ],
  },
  {
    name: "BSc",
    subjects: [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Botany",
      "Zoology",
      "Biotechnology",
      "Microbiology",
      "Electronics",
      "Statistics",
      "Environmental Science",
    ],
  },
  {
    name: "BE/BTech",
    subjects: [
      "Engineering Mathematics",
      "Engineering Physics",
      "Engineering Chemistry",
      "Basic Electrical Engineering",
      "Programming for Problem Solving",
      "Engineering Graphics",
      "Mechanics",
      "Thermodynamics",
      "Analog Electronics",
      "Digital Signal Processing",
      "Microprocessors",
      "Control Systems",
      "VLSI Design",
    ],
  },
];

export const ALL_SUBJECTS = Array.from(new Set(COURSES.flatMap((c) => c.subjects))).sort();
export const COURSE_NAMES = COURSES.map((c) => c.name);
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
