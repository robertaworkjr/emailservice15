import { v4 as uuidv4 } from 'uuid';
import database from '../config/database.js';

class EmailGenerator {
  constructor() {
    this.adjectives = [
      'quick', 'bright', 'cool', 'smart', 'fast', 'blue', 'red', 'green',
      'happy', 'lucky', 'magic', 'super', 'mega', 'ultra', 'prime', 'alpha',
      'beta', 'gamma', 'delta', 'omega', 'swift', 'sharp', 'bold', 'brave'
    ];
    
    this.nouns = [
      'fox', 'cat', 'dog', 'bird', 'fish', 'star', 'moon', 'sun',
      'lion', 'tiger', 'bear', 'wolf', 'eagle', 'shark', 'whale', 'dragon',
      'phoenix', 'unicorn', 'knight', 'wizard', 'ninja', 'robot', 'cyber', 'tech'
    ];
  }

  generateRandomEmail() {
    const adjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const noun = this.nouns[Math.floor(Math.random() * this.nouns.length)];
    const numbers = Math.floor(Math.random() * 9999) + 1;
    
    const username = `${adjective}${noun}${numbers}`;
    const domain = process.env.EMAIL_DOMAIN || 'yourdomain.com';
    
    return `${username}@${domain}`;
  }

  async createTemporaryEmail(sessionId, ipAddress) {
    try {
      let email;
      let attempts = 0;
      const maxAttempts = 10;

      // Generate unique email address
      do {
        email = this.generateRandomEmail();
        attempts++;
        
        if (attempts > maxAttempts) {
          throw new Error('Failed to generate unique email address');
        }
        
        // Check if email already exists
        const existing = await database.db.get(
          'SELECT id FROM emails WHERE email_address = ?',
          [email]
        );
        
        if (!existing) break;
      } while (attempts < maxAttempts);

      // Calculate expiry time (15 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(process.env.EMAIL_EXPIRY_MINUTES || 15));

      // Create email record
      const emailId = uuidv4();
      await database.db.run(`
        INSERT INTO emails (id, email_address, expires_at, session_id)
        VALUES (?, ?, ?, ?)
      `, [emailId, email, expiresAt.toISOString(), sessionId]);

      // Update session activity
      await database.db.run(`
        INSERT OR REPLACE INTO sessions (id, last_activity, ip_address)
        VALUES (?, datetime('now'), ?)
      `, [sessionId, ipAddress]);

      console.log(`Created temporary email: ${email} (expires: ${expiresAt.toISOString()})`);

      return {
        id: emailId,
        email: email,
        expiresAt: expiresAt.toISOString(),
        sessionId: sessionId
      };

    } catch (error) {
      console.error('Error creating temporary email:', error);
      throw error;
    }
  }

  async getEmailMessages(emailAddress, sessionId) {
    try {
      // Verify email belongs to session and is still active
      const emailRecord = await database.db.get(`
        SELECT * FROM emails 
        WHERE email_address = ? AND session_id = ? AND is_active = 1 AND expires_at > datetime('now')
      `, [emailAddress, sessionId]);

      if (!emailRecord) {
        throw new Error('Email not found or expired');
      }

      // Get messages for this email
      const messages = await database.db.all(`
        SELECT * FROM messages 
        WHERE email_id = ? 
        ORDER BY received_at DESC
      `, [emailRecord.id]);

      return messages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        subject: msg.subject,
        preview: (msg.body_text || '').substring(0, 100),
        body: msg.body_text,
        bodyHtml: msg.body_html,
        receivedAt: msg.received_at,
        attachments: msg.attachments ? JSON.parse(msg.attachments) : [],
        isRead: msg.is_read === 1
      }));

    } catch (error) {
      console.error('Error getting email messages:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId, sessionId) {
    try {
      await database.db.run(`
        UPDATE messages 
        SET is_read = 1 
        WHERE id = ? AND email_id IN (
          SELECT id FROM emails WHERE session_id = ?
        )
      `, [messageId, sessionId]);

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async cleanupExpiredEmails() {
    try {
      const result = await database.db.run(`
        DELETE FROM emails 
        WHERE expires_at <= datetime('now') OR is_active = 0
      `);

      if (result.changes > 0) {
        console.log(`Cleaned up ${result.changes} expired emails`);
      }

      return result.changes;
    } catch (error) {
      console.error('Error cleaning up expired emails:', error);
      throw error;
    }
  }
}

export default new EmailGenerator();