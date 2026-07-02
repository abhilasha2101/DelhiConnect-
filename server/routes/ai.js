const express = require('express');
const router = express.Router();
const { categorizeComplaint, handleChat } = require('../services/geminiService');
const { optionalAuth } = require('../middleware/auth');

// POST /api/ai/categorize
router.post('/categorize', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'text is required' });
  const result = await categorizeComplaint(text);
  res.json(result);
});

// POST /api/ai/chat
router.post('/chat', optionalAuth, async (req, res) => {
  const { text, coordinates } = req.body;
  if (!text) return res.status(400).json({ message: 'text is required' });
  const result = await handleChat(text, req.user, coordinates);
  res.json(result);
});

module.exports = router;
