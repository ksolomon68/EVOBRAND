const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const PROPERTY_ID = process.env.GA_PROPERTY_ID || '540387549';

function getClient() {
  const keyJson = process.env.GA_SERVICE_ACCOUNT_KEY;
  if (!keyJson) return null;
  try {
    const { BetaAnalyticsDataClient } = require('@google-analytics/data');
    const credentials = JSON.parse(keyJson);
    return new BetaAnalyticsDataClient({ credentials });
  } catch {
    return null;
  }
}

router.use(authenticateToken, requireAdmin);

router.get('/overview', async (req, res) => {
  const client = getClient();
  if (!client) return res.status(503).json({ error: 'GA_SERVICE_ACCOUNT_KEY not configured' });
  try {
    const [response] = await client.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    });
    const vals = response.rows?.[0]?.metricValues || [];
    res.json({
      sessions: parseInt(vals[0]?.value || 0),
      users: parseInt(vals[1]?.value || 0),
      pageViews: parseInt(vals[2]?.value || 0),
      avgSessionDuration: parseFloat(vals[3]?.value || 0),
      bounceRate: parseFloat(vals[4]?.value || 0),
    });
  } catch (err) {
    console.error('GA overview error:', err.message);
    res.status(500).json({ error: 'Failed to fetch GA overview' });
  }
});

router.get('/daily', async (req, res) => {
  const client = getClient();
  if (!client) return res.status(503).json({ error: 'GA_SERVICE_ACCOUNT_KEY not configured' });
  try {
    const [response] = await client.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    });
    const rows = (response.rows || []).map(row => {
      const raw = row.dimensionValues[0].value; // YYYYMMDD
      const d = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      return {
        date: d,
        sessions: parseInt(row.metricValues[0].value),
        users: parseInt(row.metricValues[1].value),
      };
    });
    res.json(rows);
  } catch (err) {
    console.error('GA daily error:', err.message);
    res.status(500).json({ error: 'Failed to fetch GA daily data' });
  }
});

router.get('/pages', async (req, res) => {
  const client = getClient();
  if (!client) return res.status(503).json({ error: 'GA_SERVICE_ACCOUNT_KEY not configured' });
  try {
    const [response] = await client.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'averageSessionDuration' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    });
    const pages = (response.rows || []).map(row => ({
      path: row.dimensionValues[0].value,
      title: row.dimensionValues[1].value,
      views: parseInt(row.metricValues[0].value),
      avgDuration: parseFloat(row.metricValues[1].value),
    }));
    res.json(pages);
  } catch (err) {
    console.error('GA pages error:', err.message);
    res.status(500).json({ error: 'Failed to fetch GA pages' });
  }
});

module.exports = router;
