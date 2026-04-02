export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { resume, jd } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: `You are a senior technical recruiter...
      
RESUME:
${resume}

JOB DESCRIPTION:
${jd}

Return ONLY raw JSON, no markdown:
{
  "score": <0-100>,
  "verdict": "<Strong Match|Good Match|Partial Match|Weak Match>",
  "matching": ["up to 5 matching skills"],
  "missing": ["up to 5 gaps"],
  "tip": "<one actionable sentence>"
}` }]
    })
  });

  const data = await response.json();
  const text = data.content.map(b => b.text || '').join('').replace(/```json|```/g,'').trim();
  res.status(200).json(JSON.parse(text));
}
