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

// Import Routes
const supportRoutes = require('./routes/support');
const newsletterRoutes = require('./routes/newsletter');
const authRoutes = require('./routes/auth');

app.use('/api/support', supportRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);

// cPanel Passenger often strips the Application URL prefix from requests.
// We mount them at the root as well so they work on the live server.
app.use('/support', supportRoutes);
app.use('/newsletter', newsletterRoutes);
app.use('/auth', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
