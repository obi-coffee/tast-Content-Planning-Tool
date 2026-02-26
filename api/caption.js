export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { channel, context, product, tone, brandVoice } = req.body;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `You are the voice of tāst, a specialty coffee company. Generate 3 distinct social media captions for ${channel}.

BRAND VOICE & GUIDELINES:
${brandVoice}

POST CONTEXT: ${context}
${product ? `PRODUCT: ${product}` : ""}
TONE DIRECTION: ${tone}

Return ONLY a JSON array of 3 strings — no markdown, no explanation, no preamble. Each caption should feel distinct. For Instagram include relevant hashtags at the end.`
      }]
    })
  });

  const data = await response.json();
  const text = data.content?.find(b => b.type === "text")?.text || "[]";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    const captions = JSON.parse(clean);
    res.status(200).json({ captions });
  } catch {
    res.status(500).json({ captions: ["Error parsing response. Please try again."] });
  }
}