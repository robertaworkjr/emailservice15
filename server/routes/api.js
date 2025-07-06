import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import EmailGenerator from '../services/EmailGenerator.js';
import { validateSession, rateLimiter } from '../middleware/security.js';

const router = express.Router();

// Generate new temporary email
router.post('/email/generate', rateLimiter, async (req, res) => {
  try {
    const sessionId = req.body.sessionId || uuidv4();
    const ipAddress = req.ip || req.connection.remoteAddress;

    const emailData = await EmailGenerator.createTemporaryEmail(sessionId, ipAddress);

    res.json({
      success: true,
      data: emailData
    });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate email address'
    });
  }
});

// Get messages for an email address
router.get('/email/:emailAddress/messages', validateSession, async (req, res) => {
  try {
    const { emailAddress } = req.params;
    const sessionId = req.query.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required'
      });
    }

    const messages = await EmailGenerator.getEmailMessages(emailAddress, sessionId);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get messages'
    });
  }
});

// Mark message as read
router.patch('/message/:messageId/read', validateSession, async (req, res) => {
  try {
    const { messageId } = req.params;
    const sessionId = req.body.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required'
      });
    }

    await EmailGenerator.markMessageAsRead(messageId, sessionId);

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark message as read'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;