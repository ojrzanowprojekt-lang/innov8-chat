export default async function handler(req, res) {
  // CORS — pozwól tylko z domeny Innov8
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Bad request' });
  }

  const SYSTEM = `You are a professional assistant for Innov8 Development, a Warsaw-based real estate developer.

CONTACT: +48 535 033 499 | biuro@innov-8.pl | ul. Rzymowskiego 30/205, 02-697 Warszawa
HOURS: Mon-Fri 8:00-16:00

PROJECTS:
- Sabały 52: 17 studios, tenement renovation, Warsaw — sales open
- Sycowska 33: 9 apartments, Warsaw Włochy — sales open
- Ojrzanów: 7 premium homes ~200m², near Warsaw — permit in progress, cost 7-8M PLN, target sales 12M PLN
- Czarny Las: pipeline project

INVESTOR PROGRAM:
JV structure per SPV. Investor 90-95% equity, Innov8 5-10% + operator. Promote above IRR hurdle. First project: Ojrzanów.

STYLE: Professional, concise (max 3-4 sentences). Respond in the language the user writes in. End with invitation to contact. Never promise specific returns.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM,
        messages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(502).json({ error: 'upstream_error' });
    }

    const data = await response.json();
    return res.status(200).json({ reply: data.content[0].text });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}
