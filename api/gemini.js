const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function getTextFromGemini(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  const temperature = Number.isFinite(Number(req.body?.temperature))
    ? Number(req.body.temperature)
    : 0.2;
  const maxOutputTokens = Number.isFinite(Number(req.body?.maxOutputTokens))
    ? Number(req.body.maxOutputTokens)
    : 1024;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }
  if (prompt.length > 16000) {
    return res.status(400).json({ error: "Prompt too long" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing GEMINI_API_KEY" });
  }

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Gemini API request failed",
        details: data?.error?.message || "Unknown Gemini error",
      });
    }

    const text = getTextFromGemini(data);
    if (!text) {
      return res.status(502).json({ error: "Gemini returned empty content" });
    }

    return res.status(200).json({ text });
  } catch {
    return res.status(500).json({ error: "Internal server error while calling Gemini" });
  }
}
