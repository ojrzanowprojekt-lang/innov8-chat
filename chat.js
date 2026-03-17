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

CONTACT: +48 535 033 499 | biuro@innov-8.pl
Registered office: ul. Grzybowska 87, 00-844 Warszawa
Office: ul. Rzymowskiego 30/205, 02-697 Warszawa
Hours: Mon-Fri 8:00-16:00

PROJECTS:
- Sabały 52: 17 studios, tenement renovation, Warsaw — sales open → sabaly52.pl
- Sycowska 33: 9 apartments 19-55m², Warsaw Włochy — sales open
- Ojrzanów: 7 premium homes ~200m², near Warsaw — permit in progress
- Czarny Las: pipeline project, details TBD

PARTNERSHIP:
Innov8 looks for properties to acquire or develop together in Warsaw and surroundings — tenement buildings, buildings requiring renovation, and building plots. We buy for cash, develop projects, or collaborate as a partner. Free valuation, no-obligation consultation.

RULES:
- Never discuss investment returns, yields, IRR, equity structures or financial projections
- If asked about investment returns or financial instruments, politely explain that Innov8 is a developer and operator, not a financial services provider, and direct the user to contact the office directly
- Respond in the language the user writes in
- Keep answers professional and concise (max 3-4 sentences)
- Always end with an invitation to contact the office`;

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
