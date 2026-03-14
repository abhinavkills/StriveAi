/**
 * GEMINI API INTEGRATION
 * Handles communication with Google's Generative AI for dynamic level generation.
 */

const GEMINI_API_KEY = "AIzaSyDtugk_yAPCVwCJ3n9FRHeqbtiOmz1rqCg";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function generateGamifiedSyllabus(syllabusText, subjectName) {
  const prompt = `
    Convert the following syllabus for the subject "${subjectName}" into a gamified study module. 
    Divide the syllabus into exactly 5 progressive learning levels.
    
    Each level MUST contain:
    1. title: A catchy name for the level.
    2. explanation: A deep but easy to understand explanation of the core concepts for this level (at least 200 words).
    3. summary: A short 2-sentence wrap-up.
    4. examples: Array of 2-3 practical examples.
    5. questions: Array of 3 multiple choice questions. Each question must have "q", "options" (array of 4), and "correct" (index 0-3).
    6. challenge: A short "riddle" or logical challenge related to the topic.

    Syllabus:
    ${syllabusText}

    Output the result as a STRICT JSON object in the following format:
    {
      "levels": [
        {
          "title": "Level Title",
          "explanation": "Long text...",
          "summary": "Short text...",
          "examples": ["Ex 1", "Ex 2"],
          "questions": [
            {"q": "Q1", "options": ["A", "B", "C", "D"], "correct": 0}
          ],
          "challenge": "Challenge text"
        }
      ]
    }
  `;

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            response_mime_type: "application/json",
        }
      })
    });

    if (!response.ok) throw new Error("Gemini API Error: " + response.statusText);
    
    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Error generating syllabus:", error);
    return null;
  }
}
