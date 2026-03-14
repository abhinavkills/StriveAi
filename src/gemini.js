/**
 * GEMINI API INTEGRATION
 * Handles communication with Google's Generative AI for dynamic level generation.
 */

export async function generateGamifiedSyllabus(syllabusText, subjectName) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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

  if (!apiKey) {
    console.error("FORGE ERROR: VITE_GEMINI_API_KEY is missing in your environment!");
    return { success: false, error: "API Key missing (Check Vercel Dashboard)" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData.error?.message || response.statusText;
      console.error(`FORGE API ERROR (${response.status}): ${msg}`);
      return { success: false, error: msg };
    }
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("FORGE ERROR: Invalid API response structure", data);
      return { success: false, error: "Invalid response from AI" };
    }

    let resultText = data.candidates[0].content.parts[0].text;
    
    // Clean up potential markdown blocks
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
      const parsed = JSON.parse(resultText);
      return { success: true, levels: parsed.levels || parsed };
    } catch (e) {
      console.error("FORGE PARSE ERROR:", e, resultText);
      return { success: false, error: "Failed to parse AI response" };
    }
  } catch (error) {
    console.error("FORGE CATASTROPHE:", error);
    return { success: false, error: error.message };
  }
}

export async function generateStudyNotes(topic) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
    You are an ancient scholar in a magical library. Provide a detailed study summary for the topic: "${topic}".
    Format the response as HTML using medieval and scholarly language.
    Include:
    1. A grand title wrapped in <h3 style="color:var(--gold); text-decoration:underline;">Scroll of ${topic}</h3>
    2. Section I: Foundations (detailed explanation)
    3. Section II: Core Essences (key bullet points)
    4. Section III: Scholarly Conclusion (a 2-sentence wrap-up)
    5. A closing signature in <p style="margin-top:15px; font-size:0.8rem; color:var(--gold-dark); text-align:right;">— Transcribed in the Arcane Academy Library</p>
    
    Keep the tone mysterious but very educational. Use parchment-colored highlights where necessary.
  `;

  if (!apiKey) return { success: false, error: "API Key missing" };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          response_mime_type: "text/plain",
          temperature: 0.7 
        }
      })
    });

    if (!response.ok) return { success: false, error: "Failed to reach the scholar" };

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text.replace(/```html/g, "").replace(/```/g, "").trim();
    return { success: true, content: resultText };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function generateStudyPlan(topic) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
    Create a 5-step strategic study plan for the topic: "${topic}".
    The steps should be progressive and concise, suitable for a quest log.
    Output ONLY moving a JSON array of strings.
    Example: ["Understand core concepts", "Memorize key formulas", "Solve practice problems", "Take a mock test", "Review errors"]
  `;

  if (!apiKey) return { success: false, error: "API Key missing" };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.7 
        }
      })
    });

    if (!response.ok) return { success: false, error: "AI Error" };

    const data = await response.json();
    let resultText = data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
      const tasks = JSON.parse(resultText);
      return { success: true, tasks };
    } catch (e) {
      return { success: false, error: "Failed to parse AI plan" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
