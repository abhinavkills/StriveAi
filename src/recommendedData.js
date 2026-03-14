export const recommendedQuestsData = {
  math: [
    {
      title: "Trial I: Runes of Algebra",
      explanation: "You must balance the scales of numerical power. Solve the quadratic glyphs to progress.",
      summary: "The equations are solved. The balance of the realm is restored.",
      questions: [
        { q: "What are the roots of the equation x² - 5x + 6 = 0?", options: ["2, 3", "1, 6", "-2, -3", "2, -3"], correct: 0 },
        { q: "If 4x - 5 = 7, what is the value of x²?", options: ["9", "16", "25", "4"], correct: 0 },
        { q: "Simplify: (x³ * x⁴) / x²", options: ["x⁵", "x⁶", "x⁹", "x¹²"], correct: 0 }
      ]
    },
    {
      title: "Trial II: Circles of Geometry",
      explanation: "Measure the shapes of the cosmos. Geometry is the language of the physical world.",
      summary: "The dimensions are measured. Your vision of the world is now clearer.",
      questions: [
        { q: "What is the volume of a sphere with radius 3? (Formula: 4/3πr³)", options: ["12π", "18π", "36π", "24π"], correct: 2 },
        { q: "Find the hypotenuse of a triangle with sides 5 and 12.", options: ["13", "14", "15", "17"], correct: 0 },
        { q: "What is the sum of interior angles of a hexagon?", options: ["540°", "720°", "900°", "1080°"], correct: 1 }
      ]
    },
    {
      title: "Trial III: Flow of Calculus",
      explanation: "Study the rate at which things change. The flux is the key to motion.",
      summary: "You have mastered the instantaneous change. Time is your ally.",
      questions: [
        { q: "What is the derivative of sin(x)?", options: ["cos(x)", "-cos(x)", "sin(x)", "tan(x)"], correct: 0 },
        { q: "Find the derivative of 3x² + 2x + 1.", options: ["6x + 2", "3x + 2", "6x² + 2", "x + 1"], correct: 0 },
        { q: "What is the integral of 1/x dx?", options: ["ln|x| + C", "e^x + C", "x² + C", "-1/x² + C"], correct: 0 }
      ]
    },
    {
      title: "Trial IV: Matrix Arcana",
      explanation: "Wield the power of arrays and dimensions. Linear transformations await.",
      summary: "The matrices are aligned. Your influence extends across multiple dimensions.",
      questions: [
        { q: "What is the determinant of a 2x2 matrix [[1, 2], [3, 4]]?", options: ["-2", "2", "1", "10"], correct: 0 },
        { q: "Which matrix operation is NOT commutative?", options: ["Addition", "Multiplication", "Subtraction", "Scalar Mult"], correct: 1 },
        { q: "What is the identity matrix I for a 2x2 system?", options: ["[[1,0],[0,1]]", "[[0,1],[1,0]]", "[[1,1],[1,1]]", "[[0,0],[0,0]]"], correct: 0 }
      ]
    },
    {
      title: "Trial V: Infinite Series",
      explanation: "Sum the infinite to find the finite. The ultimate test of convergence.",
      summary: "The infinite has been bound. You are now a Master of Sacred Mathematics.",
      questions: [
        { q: "Does the series Σ(1/n) from 1 to ∞ converge?", options: ["Yes", "No", "Only if n is even", "Only if n is prime"], correct: 1 },
        { q: "What is the sum of the geometric series 1 + 1/2 + 1/4 + 1/8...?", options: ["1.5", "2", "Infinite", "1.75"], correct: 1 },
        { q: "What is the first term of the Taylor series for e^x centered at 0?", options: ["0", "1", "x", "x²"], correct: 1 }
      ]
    }
  ],
  chemistry: [
    {
      title: "Trial I: Elemental Bonds",
      explanation: "Learn how atoms cling to one another. The secret of the structure is in the bond.",
      summary: "The elements are bound. You understand the glue of the universe.",
      questions: [
        { q: "Which bond involves the sharing of electrons?", options: ["Ionic", "Covalent", "Metallic", "Hydrogen"], correct: 1 },
        { q: "What is the molecular geometry of CO₂?", options: ["Bent", "Linear", "Tetrahedral", "Trigonal Pyramidal"], correct: 1 },
        { q: "Which element is the most electronegative?", options: ["Oxygen", "Fluorine", "Nitrogen", "Chlorine"], correct: 1 }
      ]
    },
    {
      title: "Trial II: The Stoichiometry Cauldron",
      explanation: "Balance your reactants or face an explosion. Precision is alchemy.",
      summary: "The brew is perfect. Your measurements are flawless.",
      questions: [
        { q: "How many moles are in 18g of water (H₂O)? (Atomic wts: H=1, O=16)", options: ["0.5 mol", "1 mol", "2 mol", "18 mol"], correct: 1 },
        { q: "What is the limiting reactant?", options: ["Reactant used up first", "Reactant in excess", "Reactant that is toxic", "The catalyst"], correct: 0 },
        { q: "What is Avogadro's number?", options: ["6.02x10²²", "6.02x10²³", "6.02x10²⁴", "6.02x10²¹"], correct: 1 }
      ]
    },
    {
      title: "Trial III: Kinetic Essences",
      explanation: "Control the speed of change. Some things are slow, others happen in a blink.",
      summary: "The reaction is managed. You control the flow of time in matter.",
      questions: [
        { q: "What does a catalyst do?", options: ["Increases temp", "Lowers activation energy", "Changes pH", "Stops the reaction"], correct: 1 },
        { q: "Which factor does NOT affect reaction rate?", options: ["Concentration", "Pressure", "Surface Area", "Color"], correct: 3 },
        { q: "What is the unit of a first-order rate constant?", options: ["s⁻¹", "M/s", "M⁻¹s⁻¹", "M"], correct: 0 }
      ]
    },
    {
      title: "Trial IV: Organic Transmutations",
      explanation: "The study of the scrolls of Carbon. Life itself is written in these chains.",
      summary: "The carbon chains are forged. You speak the language of life.",
      questions: [
        { q: "What is the general formula for alkanes?", options: ["CnH2n", "CnH2n+2", "CnH2n-2", "CnHn"], correct: 1 },
        { q: "Which functional group is present in alcohols?", options: ["-CHO", "-OH", "-COOH", "-NH₂"], correct: 1 },
        { q: "What is the prefix for a 4-carbon chain?", options: ["Eth-", "Prop-", "But-", "Pent-"], correct: 2 }
      ]
    },
    {
      title: "Trial V: Equilibrium Harmony",
      explanation: "Achieve the perfect balance. Push the system, and it will push back.",
      summary: "Equilibrium is reached. You are now a Master Alchemist.",
      questions: [
        { q: "If pressure is increased, equilibrium shifts to the side with...?", options: ["More moles of gas", "Fewer moles of gas", "Liquid only", "No shift"], correct: 1 },
        { q: "What is the pH of a solution with [H+] = 10⁻⁴?", options: ["4", "10", "14", "7"], correct: 0 },
        { q: "What is the Kp expression for 2A(g) ⇌ B(g)?", options: ["P(B)/P(A)²", "P(A)²/P(B)", "P(A)*P(B)", "P(B)²/P(A)"], correct: 0 }
      ]
    }
  ],
  physics: [
    {
      title: "Trial I: Motion of Stars",
      explanation: "Calculate the path of a falling comet. Gravity is a cruel mistress.",
      summary: "The trajectory is set. You can predict the falling stars.",
      questions: [
        { q: "A ball is thrown horizontally at 10m/s. What is its vertical acceleration?", options: ["0 m/s²", "9.8 m/s²", "10 m/s²", "Depends on mass"], correct: 1 },
        { q: "What is the displacement after returning to the start point?", options: ["Max", "Zero", "Double", "Infinite"], correct: 1 },
        { q: "What is the slope of a distance-time graph?", options: ["Velocity", "Acceleration", "Jerk", "Force"], correct: 0 }
      ]
    },
    {
      title: "Trial II: Forces of the Void",
      explanation: "Push against the universe and see how it resists. Friction and Force.",
      summary: "The forces are balanced. You are an unmovable object.",
      questions: [
        { q: "What is the force required to accelerate 2kg at 5m/s²?", options: ["7N", "10N", "2.5N", "0.4N"], correct: 1 },
        { q: "Which force always acts against motion?", options: ["Gravity", "Tension", "Friction", "Normal Force"], correct: 2 },
        { q: "If net force is zero, velocity is...?", options: ["Always zero", "Increasing", "Constant", "Decreasing"], correct: 2 }
      ]
    },
    {
      title: "Trial III: Radiant Waves",
      explanation: "Bend the light and hear the sound of the void. Optics and Waves.",
      summary: "The light is bent to your will. You see what others cannot.",
      questions: [
        { q: "What color of visible light has the shortest wavelength?", options: ["Red", "Green", "Blue", "Violet"], correct: 3 },
        { q: "What is the index of refraction for a vacuum?", options: ["0", "1", "1.33", "Infinite"], correct: 1 },
        { q: "Which wave type requires a medium?", options: ["Light", "Radio", "Sound", "X-ray"], correct: 2 }
      ]
    },
    {
      title: "Trial IV: Cosmic Energy",
      explanation: "Convert your potential into kinetic might. Energy cannot be destroyed.",
      summary: "The energy flows through you. You are a conduit of the cosmos.",
      questions: [
        { q: "What is the kinetic energy (1/2mv²) of 4kg at 3m/s?", options: ["6J", "12J", "18J", "36J"], correct: 2 },
        { q: "Power is defined as work done divided by...?", options: ["Distance", "Mass", "Time", "Velocity"], correct: 2 },
        { q: "In a closed system, total energy is...?", options: ["Increasing", "Decreasing", "Conserved", "Dissipated"], correct: 2 }
      ]
    },
    {
      title: "Trial V: Quantum Relics",
      explanation: "The laws of the very small and the very fast. Reality is not what it seems.",
      summary: "The quantum veil is lifted. You are now a Master of Celestial Physics.",
      questions: [
        { q: "Who proposed E = mc²?", options: ["Newton", "Einstein", "Bohr", "Tesla"], correct: 1 },
        { q: "A photon is a packet of...?", options: ["Mass", "Charge", "Energy", "Time"], correct: 2 },
        { q: "As an object reaches the speed of light, its mass...?", options: ["Decreases", "Increases", "Stays same", "Becomes zero"], correct: 1 }
      ]
    }
  ],
  coding: [
    {
      title: "Trial I: Logic Gates",
      explanation: "Think like a machine. If and Else are your only friends.",
      summary: "The logic is sound. Your code flows without error.",
      questions: [
        { q: "What is the result of '10' == 10 in JavaScript?", options: ["true", "false", "undefined", "error"], correct: 0 },
        { q: "Which loop always executes at least once?", options: ["for", "while", "do-while", "foreach"], correct: 2 },
        { q: "What is the boolean result of (true && false) || true?", options: ["true", "false", "undefined", "null"], correct: 0 }
      ]
    },
    {
      title: "Trial II: Memory Scrolls",
      explanation: "Store your data in the correct containers. Arrays and Lists.",
      summary: "The memory is allocated. Your data is secure.",
      questions: [
        { q: "What is the index of the first element in most languages?", options: ["-1", "0", "1", "any"], correct: 1 },
        { q: "Which operation is O(1) in a Stack?", options: ["Search", "Push", "Sort", "Traversal"], correct: 1 },
        { q: "What is the length of array [1, 2, 3]?", options: ["2", "3", "4", "0"], correct: 1 }
      ]
    },
    {
      title: "Trial III: Object Summoning",
      explanation: "Create blueprints for your creations. Classes and Objects.",
      summary: "The objects are summoned. Your abstractions are powerful.",
      questions: [
        { q: "What is a constructor?", options: ["A method to delete objects", "A method to initialize objects", "A type of loop", "A design pattern"], correct: 1 },
        { q: "Which principle hides internal details?", options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"], correct: 2 },
        { q: "Can a subclass have its own methods?", options: ["Yes", "No", "Only if static", "Only if private"], correct: 0 }
      ]
    },
    {
      title: "Trial IV: Algorithm Spells",
      explanation: "Optimize your spells. Efficiency is the mark of a true coder.",
      summary: "The algorithms are optimized. You are a wizard of complexity.",
      questions: [
        { q: "What is the worst-case complexity of Bubble Sort?", options: ["O(n)", "O(log n)", "O(n²)", "O(n log n)"], correct: 2 },
        { q: "Recursion must have a...?", options: ["Loop", "Base case", "Class", "Global variable"], correct: 1 },
        { q: "Which sort is generally fastest on average?", options: ["Selection Sort", "Insertion Sort", "Quick Sort", "Bubble Sort"], correct: 2 }
      ]
    },
    {
      title: "Trial V: Network Realms",
      explanation: "Transmit your soul across the wires. Servers and APIs.",
      summary: "The connection is established. You are now a Master of Arcane Coding.",
      questions: [
        { q: "What does HTTP status 404 mean?", options: ["Success", "Forbidden", "Not Found", "Internal Error"], correct: 2 },
        { q: "Which HTTP method is used to UPDATE data?", options: ["GET", "POST", "PUT/PATCH", "DELETE"], correct: 2 },
        { q: "What does JSON stand for?", options: ["Javascript Object Notation", "Java System Online", "Joined Script One", "Just Some Ordinary Notes"], correct: 0 }
      ]
    }
  ],
  biology: [
    {
      title: "Trial I: Cellular Alchemy",
      explanation: "Peer into the smallest unit of life. The cell is a factory.",
      summary: "The cells are observed. You understand the brick and mortar of life.",
      questions: [
        { q: "Which organelle synthesizes proteins?", options: ["Mitochondria", "Ribosome", "Lysosome", "Vacuole"], correct: 1 },
        { q: "Plant cells have this, but animals don't:", options: ["Nucleus", "Ribosome", "Cell Wall", "Cytoplasm"], correct: 2 },
        { q: "What is the jelly-like substance in the cell?", options: ["Plasma", "Cytoplasm", "Chlorophyll", "DNA"], correct: 1 }
      ]
    },
    {
      title: "Trial II: Genetic Runes",
      explanation: "The blueprint of all beings. DNA is the ancient code.",
      summary: "The code is cracked. You see the future in the genes.",
      questions: [
        { q: "Which base pairs with Adenine (A) in DNA?", options: ["Guanine", "Cytosine", "Thymine", "Uracil"], correct: 2 },
        { q: "A 'Bb' genotype is called...?", options: ["Homozygous Dominant", "Homozygous Recessive", "Heterozygous", "Phenotype"], correct: 2 },
        { q: "Where is DNA primarily stored?", options: ["Ribosome", "Nucleus", "Cell Wall", "Golgi Body"], correct: 1 }
      ]
    },
    {
      title: "Trial III: Ecology of Realms",
      explanation: "The balance of the forest and the sea. All things are connected.",
      summary: "The balance is understood. You are a guardian of the ecosystem.",
      questions: [
        { q: "An organism that produces its own food is a:", options: ["Consumer", "Decomposer", "Producer", "Saprotroph"], correct: 2 },
        { q: "Which biome has the highest biodiversity?", options: ["Tundra", "Desert", "Tropical Rainforest", "Savanna"], correct: 2 },
        { q: "What is the primary source of energy for most ecosystems?", options: ["The Moon", "The Sun", "Volcanoes", "Wind"], correct: 1 }
      ]
    },
    {
      title: "Trial IV: Systemic Botany",
      explanation: "Study the silent masters of the earth. Plants are the lungs of the world.",
      summary: "The plants have spoken. You breathe with the green world.",
      questions: [
        { q: "What vessel transports water up a plant?", options: ["Phloem", "Xylem", "Stomata", "Pith"], correct: 1 },
        { q: "Where does most photosynthesis occur?", options: ["Roots", "Stem", "Leaves", "Flowers"], correct: 2 },
        { q: "What gas is RELEASED during photosynthesis?", options: ["CO₂", "Oxygen", "Nitrogen", "Hydrogen"], correct: 1 }
      ]
    },
    {
      title: "Trial V: Human Architecture",
      explanation: "The temple of the soul. The human body is a masterpiece of design.",
      summary: "The architecture is revealed. You are now a Master of Natural Biology.",
      questions: [
        { q: "Which part of the brain controls balance?", options: ["Cerebrum", "Cerebellum", "Medulla", "Thalamus"], correct: 1 },
        { q: "What is the main function of red blood cells?", options: ["Clotting", "Immunity", "Oxygen Transport", "Digestion"], correct: 2 },
        { q: "Which hormone regulates blood sugar?", options: ["Adrenaline", "Insulin", "Thyroxine", "Estrogen"], correct: 1 }
      ]
    }
  ]
};
