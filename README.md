# ⚔️ Strive AI - Fantasy RPG Study Assistant

Strive AI is a gamified, medieval fantasy-themed learning platform that transforms your mundane syllabuses into epic role-playing adventures. Driven by Google's Gemini AI, Strive AI dynamically generates structured, level-based study modules complete with deep explanations, multiple-choice challenges, and engaging storytelling.

## ✨ Features

- **Fantasy RPG Aesthetic:** A fully immersive, highly polished medieval interface with dynamic particle effects, magical transitions, and responsive cinematic visuals.
- **AI-Powered Learning Paths (Gemini 1.5):** Simply paste your syllabus, and the "Arcane Forge" (Gemini AI) will procedurally generate 5 progressive mastery levels for your chosen subject.
- **Interactive Guide Companion:** An animated, visual-novel style guide character greets you, learns your name, and provides witty feedback during your quizzes.
- **Supabase Authentication:** Secure, frictionless user authentication and data persistence. Log in to save your progression or enter as a "Guest Adventurer".
- **Dynamic Quiz Engine:** Test your knowledge at the end of every level to unlock the next part of your quest map.
- **Eldritch Dashboard:** A central "Hall of Arcane Disciplines" where you can choose and manage your learning paths.

## 🚀 Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3 (No heavy frameworks, highly optimized custom CSS)
- **AI Engine:** Google Gemini Pro API (`gemini-1.5-flash`)
- **Backend / Auth / Database:** Supabase
- **Build Tool / Deployment:** Vite / Vercel

## 🛠️ Setup & Installation

Follow these steps to deploy your own instance of the Arcane Academy.

### 1. Clone the Repository
```bash
git clone https://github.com/abhinavkills/StriveAi.git
cd StriveAi
```

### 2. Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed, then run:
```bash
npm install
```

### 3. Environment Variables
You will need to set up API keys for both Supabase and Gemini.
Create a `.env` file in the root directory and add the following lines (replace with your actual keys):

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the Local Development Server
Launch the application locally:
```bash
npm run dev
```
Navigate to `http://localhost:5173/` in your browser.

## 🏰 How to Play (Study)

1. **Enroll:** Create an account or enter as a Guest.
2. **Meet your Guide:** Go through the introductory sequence and give your animated magical guide a name.
3. **Choose a Path:** Select a discipline from the Hall of Arcane Disciplines (e.g., Alchemy/Chemistry, Logic/Math).
4. **Invoke Power:** Paste the text of whatever syllabus, document, or topic you want to learn.
5. **Embark:** Navigate the generated Level Map, read the Arcane Theory, and pass the tests to conquer the curriculum. 

## 📝 License
This project is open-source. Feel free to fork, expand, and turn your own study guides into epic quests!
