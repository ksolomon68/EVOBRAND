const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createSalesService } = require('../utils/sales');
const { STAGES, STAGE_LABELS, EMAIL_TEMPLATES } = require('../utils/salesFields');

function createSalesRouter(db) {
  const router = express.Router();
  const service = createSalesService(db);
  router.use(authenticateToken, requireAdmin);
  const handle = fn => async (req, res) => {
    try { await fn(req, res); }
    catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'This email already has a pipeline contact. Open the existing lead.' });
      if (error.status) return res.status(error.status).json({ error: error.message });
      console.error('Sales pipeline:', error.message);
      res.status(500).json({ error: 'Unable to save or load the sales pipeline. Please try again.' });
    }
  };
  router.param('id', (req, res, next, value) => {
    if (!/^[1-9]\d{0,9}$/.test(value)) return res.status(400).json({ error: 'Invalid lead ID' });
    next();
  });
  router.get('/', handle(async (req, res) => {
    const [leads] = await db.query('SELECT * FROM sales_leads ORDER BY created_at DESC, id DESC');
    res.json({ leads, stages: STAGES.map((id, i) => ({ id, label: STAGE_LABELS[i] })), templates: EMAIL_TEMPLATES });
  }));
  router.post('/', handle(async (req, res) => res.status(201).json(await service.create(req.body, req.user.id))));
  router.get('/:id', handle(async (req, res) => res.json(await service.history(req.params.id))));
  router.patch('/:id', handle(async (req, res) => res.json(await service.update(req.params.id, req.body, req.user.id))));
  router.post('/:id/activities', handle(async (req, res) => res.status(201).json(await service.addActivity(req.params.id, req.body, req.user.id))));
  return router;
}

module.exports = createSalesRouter(require('../db/connection'));
module.exports.createSalesRouter = createSalesRouter;
