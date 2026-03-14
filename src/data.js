// ==========================================
// Quiz Data - Sample questions for each subject
// ==========================================
export const quizData = {
  math: [
    { q: "What is the derivative of x²?", options: ["x", "2x", "2x²", "x³"], correct: 1 },
    { q: "What is 15% of 200?", options: ["20", "25", "30", "35"], correct: 2 },
    { q: "Solve: 3x + 7 = 22", options: ["x = 3", "x = 5", "x = 7", "x = 4"], correct: 1 },
    { q: "What is the area of a circle with radius 5?", options: ["25π", "10π", "15π", "50π"], correct: 0 },
    { q: "What is log₁₀(1000)?", options: ["2", "3", "4", "10"], correct: 1 },
  ],
  chemistry: [
    { q: "What is the atomic number of Carbon?", options: ["4", "6", "8", "12"], correct: 1 },
    { q: "Which gas is most abundant in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correct: 2 },
    { q: "What is the pH of pure water?", options: ["5", "7", "9", "14"], correct: 1 },
    { q: "What is the chemical formula for table salt?", options: ["NaOH", "NaCl", "KCl", "CaCl₂"], correct: 1 },
    { q: "How many electrons does Helium have?", options: ["1", "2", "4", "8"], correct: 1 },
  ],
  physics: [
    { q: "What is the SI unit of force?", options: ["Joule", "Watt", "Newton", "Pascal"], correct: 2 },
    { q: "What is the speed of light approximately?", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], correct: 1 },
    { q: "What is Newton's second law?", options: ["F = ma", "E = mc²", "V = IR", "P = IV"], correct: 0 },
    { q: "What type of energy is stored in a spring?", options: ["Kinetic", "Thermal", "Potential", "Nuclear"], correct: 2 },
    { q: "What is the unit of electric resistance?", options: ["Ampere", "Volt", "Ohm", "Coulomb"], correct: 2 },
  ],
  coding: [
    { q: "What does HTML stand for?", options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyper Transfer Markup Language"], correct: 0 },
    { q: "Which symbol is used for comments in Python?", options: ["//", "/*", "#", "--"], correct: 2 },
    { q: "What is the time complexity of binary search?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], correct: 2 },
    { q: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"], correct: 1 },
    { q: "Which data structure uses FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], correct: 1 },
  ],
  biology: [
    { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"], correct: 2 },
    { q: "How many chromosomes do humans have?", options: ["23", "44", "46", "48"], correct: 2 },
    { q: "What is photosynthesis primarily used for?", options: ["Respiration", "Food production", "Movement", "Reproduction"], correct: 1 },
    { q: "Which blood type is the universal donor?", options: ["A", "B", "AB", "O"], correct: 3 },
    { q: "What is the largest organ in the human body?", options: ["Liver", "Brain", "Skin", "Heart"], correct: 2 },
  ]
};

export const subjectConfig = {
  math: {
    name: "Sacred Mathematics",
    role: "Master the runes of logic and numerical reality.",
    icon: "🖋️",
    cardArt: "/assets/math_card_art.png",
    desc: "Sacred geometry and numerical truth.",
    cssClass: "math",
    color: "#c9a44c"
  },
  chemistry: {
    name: "Alchemical Chemistry",
    role: "Master the laws of transformation and essence.",
    icon: "🧪",
    cardArt: "/assets/chemistry_card_art.png",
    desc: "Transmute matter and potion brewing.",
    cssClass: "chemistry",
    color: "#a352ff"
  },
  physics: {
    name: "Celestial Physics",
    role: "Master the laws of the cosmos and the stars.",
    icon: "♈",
    cardArt: "/assets/physics_card_art.png",
    desc: "Astrology meets fundamental physics.",
    cssClass: "physics",
    color: "#4682e6"
  },
  coding: {
    name: "Arcane Coding",
    role: "Master the allenturos and binary spells.",
    icon: "💻",
    cardArt: "/assets/coding_card_art.png",
    desc: "Digital spells and scrolling logic.",
    cssClass: "coding", 
    color: "#00d4ff"
  },
  biology: {
    name: "Natural Biology",
    role: "Master the laws of nature and the organic helix.",
    icon: "🌿",
    cardArt: "/assets/biology_card_art.png",
    desc: "Life forces and natural growth.",
    cssClass: "biology",
    color: "#4caf50"
  },
  essentials: {
    name: "Scholar Guild",
    role: "Access traditional study tools and ancient planners.",
    icon: "📜",
    cardArt: "/assets/parchment_bg.png",
    desc: "The library of scrolls.",
    cssClass: "essentials",
    color: "#d4a847"
  }
};

export const ranks = [
  { name: "Apprentice", xpRequired: 0, icon: "🔰" },
  { name: "Alchemist", xpRequired: 100, icon: "⚗️" },
  { name: "Elementalist", xpRequired: 300, icon: "🔮" },
  { name: "Master Scholar", xpRequired: 600, icon: "📖" },
  { name: "Grand Wizard", xpRequired: 1000, icon: "🧙" }
];
