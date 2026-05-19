const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const AI_TIMEOUT_MS = 30000;
const MAX_SESSIONS = 100;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    cb(file.mimetype.startsWith('image/') ? null : new Error('Only image files are allowed'), file.mimetype.startsWith('image/'));
  }
});

const chatSessions = new Map();

function evictOldestSession() {
  if (chatSessions.size >= MAX_SESSIONS) {
    const oldestKey = chatSessions.keys().next().value;
    chatSessions.delete(oldestKey);
  }
}

// Helper function to convert buffer to generative part
const bufferToGenerativePart = (buffer, mimeType) => ({
  inlineData: {
    data: buffer.toString('base64'),
    mimeType,
  },
});

// Helper function to create system prompt for plant care assistant
function getSystemPrompt() {
  return `You are a specialized AI Plant Care Assistant for "Greenify", a plant e-commerce platform. You ONLY answer questions related to plants, gardening, and botanical topics.

YOUR EXPERTISE INCLUDES:
- Plant care advice (watering, lighting, fertilizing, pruning, repotting)
- Plant disease identification and treatment
- Pest identification and management
- Plant identification and naming
- Soil and nutrient requirements
- Indoor and outdoor gardening tips
- Plant propagation techniques
- Seasonal plant care
- Plant selection advice
- Garden planning and design

STRICT GUIDELINES:
- ONLY respond to plant and gardening-related questions
- If asked about non-plant topics (technology, politics, general knowledge, etc.), politely decline and redirect to plant topics
- When analyzing images, focus only on plant-related observations
- Provide accurate, practical, and actionable plant care advice
- If uncertain about plant diagnosis, recommend consulting local experts
- Be specific and detailed in your plant care recommendations
- Always prioritize plant health and safety

RESPONSE FORMAT:
- Keep responses helpful but focused on plants
- Use clear, actionable language
- Structure advice with bullet points when appropriate
- Include warnings about toxic plants when relevant

If someone asks about non-plant topics, respond with: "I'm specifically designed to help with plant care and gardening questions. Please ask me about plant care, identification, diseases, or any other plant-related topics!"

Remember: You are exclusively a plant expert - stay focused on plants and gardening only!`;
}

// POST /api/ai-chat/message - Send a message to AI (supports text, images, or both)
router.post('/message', upload.array('images', 5), async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const images = req.files;

    if (!message?.trim() && (!images?.length)) {
      return res.status(400).json({ error: 'Either message text or images must be provided' });
    }

    let chatSession;
    const newSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (sessionId && chatSessions.has(sessionId)) {
      chatSession = chatSessions.get(sessionId);
    } else {
      evictOldestSession();
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: getSystemPrompt()
      });
      chatSession = model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
      });
      chatSessions.set(newSessionId, chatSession);
    }

    const prompt = [];
    if (message?.trim()) prompt.push(message.trim());
    if (images?.length) {
      images.forEach(image => {
        prompt.push(bufferToGenerativePart(image.buffer, image.mimetype));
      });
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI_TIMEOUT')), AI_TIMEOUT_MS)
    );

    const result = await Promise.race([
      chatSession.sendMessage(prompt),
      timeoutPromise,
    ]);

    const aiMessage = result.response.text();

    res.json({
      message: aiMessage,
      sessionId: newSessionId,
      hasImages: Boolean(images?.length),
      imageCount: images?.length || 0
    });

  } catch (error) {
    console.error('AI Chat Error:', error);

    if (error.message === 'AI_TIMEOUT') {
      return res.status(504).json({
        error: 'AI response timed out. Please try a shorter query.'
      });
    }

    if (error.message.includes('API_KEY')) {
      return res.status(500).json({
        error: 'AI service configuration error. Please try again later.'
      });
    } else if (error.message.includes('SAFETY')) {
      return res.status(400).json({
        error: 'Content not allowed. Please ensure your message and images are appropriate.'
      });
    } else if (error.message.includes('QUOTA')) {
      return res.status(503).json({
        error: 'AI service temporarily unavailable. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Failed to process your request. Please try again.'
    });
  }
});

// DELETE /api/ai-chat/session/:sessionId - Clear a chat session
router.delete('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (chatSessions.has(sessionId)) {
      chatSessions.delete(sessionId);
      res.json({ message: 'Chat session cleared successfully' });
    } else {
      res.status(404).json({ error: 'Chat session not found' });
    }
  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({ error: 'Failed to clear chat session' });
  }
});

// GET /api/ai-chat/sessions - Get active session count (for monitoring)
router.get('/sessions', (req, res) => {
  try {
    res.json({ 
      activeSessions: chatSessions.size,
      sessionIds: Array.from(chatSessions.keys())
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get session information' });
  }
});

// Cleanup old sessions periodically (every 30 minutes)
const CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour

setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of chatSessions.entries()) {
    // Extract timestamp from session ID if it follows our format
    const sessionTimestamp = sessionId.startsWith('session_') ? 
      parseInt(sessionId.split('_')[1]) : now;
    
    if (now - sessionTimestamp > SESSION_TIMEOUT) {
      chatSessions.delete(sessionId);
    }
  }
}, CLEANUP_INTERVAL);

module.exports = router;
