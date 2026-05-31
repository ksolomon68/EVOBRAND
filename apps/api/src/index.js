const fs = require('fs');
process.on('uncaughtException', (err) => {
  fs.writeFileSync(__dirname + '/crash.log', err.stack);
});
process.on('unhandledRejection', (err) => {
  fs.writeFileSync(__dirname + '/crash.log', err.stack);
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'EVOBRAND API is running' });
});

app.get('/api/crash', (req, res) => {
  try {
    const log = fs.readFileSync(__dirname + '/crash.log', 'utf8');
    res.type('text/plain').send(log);
  } catch (err) {
    res.status(200).send('No crash log found. App is running fine! ' + err.message);
  }
});

// Import Routes
const supportRoutes = require('./routes/support');
const newsletterRoutes = require('./routes/newsletter');
const schedulerRoutes = require('./routes/scheduler');
const auditorRoutes = require('./routes/auditor');
const authRoutes = require('./routes/auth');

app.use('/api/support', supportRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/auditor', auditorRoutes);

// cPanel Passenger often strips the Application URL prefix from requests.
// We mount them at the root as well so they work on the live server.
app.use('/support', supportRoutes);
app.use('/newsletter', newsletterRoutes);
app.use('/auth', authRoutes);
app.use('/scheduler', schedulerRoutes);
app.use('/auditor', auditorRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
