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

Calculate an honest "overallScore" out of 100 based on these metrics.
Provide a "breakdown" of scores (out of 100) for "visual", "messaging", and "positioning".
Write a punchy, 2-3 sentence "summary" of their brand's current state.
Provide 3 actionable "recommendations".
List 2 "strengths" and 2 "weaknesses" based on their inputs.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "overallScore": number,
  "breakdown": {
    "visual": number,
    "messaging": number,
    "positioning": number
  },
  "summary": "string",
  "recommendations": ["string", "string", "string"],
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Clean up markdown code blocks if present
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const aiReport = JSON.parse(cleanedText);
      aiReport.id = `audit-${Date.now()}`;
      
      if (data.wantsCall) {
        console.log(`[Audit] ${data.contactEmail} requested a strategy call!`);
      }
      
      return res.json(aiReport);
    }

    // Fallback to basic math mock if no API key
    const digitalValues = Object.values(data.digital || {});
    const digitalAvg = digitalValues.length > 0 
      ? digitalValues.reduce((a,b) => a+b, 0) / digitalValues.length 
      : 3;
    
    let overallScore = Math.round((digitalAvg / 5) * 100);
    if (data.consistency === 'none') overallScore -= 15;
    if (data.consistency === 'some') overallScore -= 5;
    if (data.consistency === 'dialed') overallScore += 10;
    overallScore = Math.max(20, Math.min(98, overallScore));

    const mockReport = {
      id: `audit-${Date.now()}`,
      overallScore,
      breakdown: {
        visual: Math.min(100, overallScore + 5),
        messaging: Math.min(100, overallScore - 5),
        positioning: overallScore,
      },
      summary: `Based on your responses, ${data.businessName} has a solid foundation in the ${data.industry} space, but your brand consistency and digital presence are holding you back.`,
      recommendations: [
        "Develop a unified Brand Guidelines document to ensure visual consistency.",
        "Refresh your website messaging to target your specific audience more directly.",
        "Implement a consistent content strategy across your social channels."
      ],
      strengths: ["Industry experience", "Clear understanding of challenges"],
      weaknesses: data.challenges || ["Inconsistent visual identity"]
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
