const express = require('express');
const router = express.Router();

// Generate brand audit report
router.post('/audit', async (req, res) => {
  const data = req.body;
  
  if (!data.businessName || !data.industry || !data.contactEmail) {
    return res.status(400).json({ error: 'Missing required audit fields' });
  }

  try {
    // We calculate a basic mock score based on the digital ratings they provided
    const digitalValues = Object.values(data.digital || {});
    const digitalAvg = digitalValues.length > 0 
      ? digitalValues.reduce((a,b) => a+b, 0) / digitalValues.length 
      : 3;
    
    // Scale 1-5 to 0-100
    let overallScore = Math.round((digitalAvg / 5) * 100);
    
    // Penalize slightly if consistency is bad
    if (data.consistency === 'none') overallScore -= 15;
    if (data.consistency === 'some') overallScore -= 5;
    if (data.consistency === 'dialed') overallScore += 10;
    
    // Clamp between 20 and 98
    overallScore = Math.max(20, Math.min(98, overallScore));

    const mockReport = {
      id: `audit-${Date.now()}`,
      overallScore,
      breakdown: {
        visual: Math.min(100, overallScore + 5),
        messaging: Math.min(100, overallScore - 5),
        positioning: overallScore,
      },
      summary: `Based on your responses, ${data.businessName} has a solid foundation in the ${data.industry} space, but your brand consistency and digital presence are holding you back from capturing higher-value clients.`,
      recommendations: [
        "Develop a unified Brand Guidelines document to ensure visual consistency.",
        "Refresh your website messaging to target your specific audience more directly.",
        "Implement a consistent content strategy across your social channels."
      ],
      strengths: ["Industry experience", "Clear understanding of challenges"],
      weaknesses: data.challenges || ["Inconsistent visual identity"]
    };

    // If they want a call, we could trigger an email notification here
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
