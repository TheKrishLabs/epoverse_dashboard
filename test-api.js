async function run() {
  try {
    const payload = {
      prompt: "Subedaar movie review: Anil Kapoor's angsty intensity lifts this action drama above its formulaic flaws",
      promptTemplate: "You are a professional english news writer and write a comprehensive article in english. Include a catchy headline, and the full article content in 300 words. Ensure the tone is neutral and journalistic.",
      maxTokens: 50,
      modelName: "gemini-2.5-flash"
    };
    
    const res = await fetch('http://localhost:3000/api/ai-writer/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log(data);
  } catch(e) { console.error(e); }
}
run();
