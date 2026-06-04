const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Generate brand audit report using Gemini
router.post('/audit', async (req, res) => {
  const data = req.body;
  
  if (!data.businessName || !data.industry || !data.contactEmail) {
    return res.status(400).json({ error: 'Missing required audit fields' });
  }

  try {
    // If we have an API key, use Gemini. Otherwise fallback to basic math mock.
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an expert brand strategist and digital marketing auditor. 
Evaluate the following business based on their self-reported scores and challenges.
Business Name: ${data.businessName}
Industry: ${data.industry}
Brand Consistency: ${data.consistency}
Digital Presence Ratings (1-5): ${JSON.stringify(data.digital)}
Biggest Challenges: ${JSON.stringify(data.challenges || [])}

Calculate an honest "overall_score" out of 100.
Assign a "grade" (A, B, C, D, or F).
Write a punchy "headline" summarizing their brand state.
Provide a "categories" object with 3-5 categories (e.g. "visual", "digital", "messaging"). Each category should have a "label", "score" (0-100), and "insight".
Provide 2 "strengths" (array of strings) and 2 "gaps" (array of strings).
List 3 "recommendations" as objects containing "priority" (1,2,3), "impact" (High, Medium, Low), "effort" (High, Medium, Low), "title", and "detail".
Provide a 1-sentence "cta".

Respond ONLY with a valid JSON object matching this schema:
{
  "overall_score": number,
  "grade": "A|B|C|D|F",
  "headline": "string",
  "categories": {
    "cat1": { "label": "Visual Identity", "score": number, "insight": "string" },
    ...
  },
  "strengths": ["string", "string"],
  "gaps": ["string", "string"],
  "recommendations": [
    { "priority": 1, "impact": "High", "effort": "Medium", "title": "string", "detail": "string" }
  ],
  "cta": "string"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log('[Audit] Gemini raw response:', text.substring(0, 500));
      
      try {
        // Clean up markdown code blocks if present
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const raw = JSON.parse(cleanedText);

        // Normalize AI response — handle field name variations
        const rawScore = raw.overall_score ?? raw.overallScore ?? raw.score ?? 0;
        const aiReport = {
          id: `audit-${Date.now()}`,
          overall_score: Number.isFinite(Number(rawScore)) ? Number(rawScore) : 0,
          grade: raw.grade || 'C',
          headline: raw.headline || raw.summary || '',
          // categories can be object or array — normalize to object
          categories: (() => {
            const cats = raw.categories;
            if (!cats) return {};
            if (Array.isArray(cats)) {
              const obj = {};
              cats.forEach((c, i) => { obj[`cat${i}`] = c; });
              return obj;
            }
            return cats;
          })(),
          strengths: raw.strengths || raw.positives || [],
          gaps: raw.gaps || raw.weaknesses || raw.areas_for_improvement || [],
          // Normalize each recommendation's field names
          recommendations: Array.isArray(raw.recommendations)
            ? raw.recommendations.map((r, i) => {
                if (!r || typeof r !== 'object') return null;
                return {
                  priority: r.priority ?? (i + 1),
                  impact: r.impact || r.impact_level || r.impactLevel || 'Medium',
                  effort: r.effort || r.effort_level || r.effortLevel || 'Medium',
                  title: r.title || r.name || r.recommendation || r.action || r.summary || `Recommendation ${i + 1}`,
                  detail: r.detail || r.description || r.details || r.body || '',
                };
              }).filter(Boolean)
            : [],
          cta: raw.cta || raw.call_to_action || '',
        };
        
        if (data.wantsCall) {
          console.log(`[Audit] ${data.contactEmail} requested a strategy call!`);
        }
        
        return res.json(aiReport);
      } catch (parseErr) {
        console.error('[Audit] Failed to parse Gemini JSON, falling through to mock:', parseErr.message);
        // Fall through to mock below
      }
    }

    // Fallback to basic math mock if no API key or Gemini failed
    const digitalValues = Object.values(data.digital || {});
    const digitalAvg = digitalValues.length > 0 
      ? digitalValues.reduce((a,b) => a+b, 0) / digitalValues.length 
      : 3;
    
    let overall_score = Math.round((digitalAvg / 5) * 100);
    if (data.consistency === 'none') overall_score -= 15;
    if (data.consistency === 'some') overall_score -= 5;
    if (data.consistency === 'dialed') overall_score += 10;
    overall_score = Math.max(20, Math.min(98, overall_score));

    let grade = 'C';
    if (overall_score >= 90) grade = 'A';
    else if (overall_score >= 80) grade = 'B';
    else if (overall_score >= 70) grade = 'C';
    else if (overall_score >= 60) grade = 'D';
    else grade = 'F';

    const mockReport = {
      id: `audit-${Date.now()}`,
      overall_score,
      grade,
      headline: `Solid foundation in ${data.industry}, but consistency needs work.`,
      categories: {
        visual: { label: 'Visual Identity', score: Math.min(100, overall_score + 5), insight: 'Needs a unified style guide.' },
        messaging: { label: 'Messaging', score: Math.max(0, overall_score - 5), insight: 'Target audience needs more clarity.' },
        digital: { label: 'Digital Presence', score: overall_score, insight: 'Website performance is average.' }
      },
      strengths: ["Industry experience", "Clear understanding of challenges"],
      gaps: data.challenges || ["Inconsistent visual identity"],
      recommendations: [
        { priority: 1, impact: 'High', effort: 'Medium', title: 'Develop Brand Guidelines', detail: 'Create a unified document to ensure visual consistency across all platforms.' },
        { priority: 2, impact: 'Medium', effort: 'Low', title: 'Refresh Website Messaging', detail: 'Update your copy to target your specific audience more directly.' },
        { priority: 3, impact: 'Medium', effort: 'High', title: 'Consistent Content Strategy', detail: 'Implement a cohesive content calendar for your social channels.' }
      ],
      cta: 'Ready to elevate your brand to the next level?'
    };

    if (data.wantsCall) {
      console.log(`[Audit] ${data.contactEmail} requested a strategy call!`);
    }

    res.json(mockReport);
  } catch (error) {
    console.error('Error generating audit:', error);
    res.status(500).json({ error: 'Failed to generate brand audit' });
  }
});

module.exports = router;
