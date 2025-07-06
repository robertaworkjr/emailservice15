import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { v4 as uuidv4 } from 'uuid';
import database from '../config/database.js';

class EmailService {
  constructor() {
    this.imap = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async initialize() {
    try {
      await this.connectIMAP();
      this.setupEventHandlers();
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Email service initialization failed:', error);
      throw error;
    }
  }

  connectIMAP() {
    return new Promise((resolve, reject) => {
      this.imap = new Imap({
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASSWORD,
        host: process.env.IMAP_HOST,
        port: parseInt(process.env.IMAP_PORT) || 993,
        tls: process.env.IMAP_TLS === 'true',
        tlsOptions: { rejectUnauthorized: false }
      });

      this.imap.once('ready', () => {
        console.log('IMAP connection established');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.imap.once('error', (err) => {
        console.error('IMAP connection error:', err);
        this.isConnected = false;
        reject(err);
      });

      this.imap.once('end', () => {
        console.log('IMAP connection ended');
        this.isConnected = false;
        this.handleReconnect();
      });

      this.imap.connect();
    });
  }

  setupEventHandlers() {
    this.imap.on('mail', (numNewMsgs) => {
      console.log(`${numNewMsgs} new messages received`);
      this.fetchNewEmails();
    });
  }

  async handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(async () => {
        try {
          await this.connectIMAP();
        } catch (error) {
          console.error('Reconnection failed:', error);
        }
      }, 5000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  async fetchNewEmails() {
    if (!this.isConnected) return;

    try {
      await this.openInbox();
      
      // Search for unseen emails
      const uids = await this.searchEmails(['UNSEEN']);
      
      if (uids.length === 0) {
        console.log('No new emails found');
        return;
      }

      console.log(`Processing ${uids.length} new emails`);
      
      for (const uid of uids) {
        await this.processEmail(uid);
      }
    } catch (error) {
      console.error('Error fetching new emails:', error);
    }
  }

  openInbox() {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) reject(err);
        else resolve(box);
      });
    });
  }

  searchEmails(criteria) {
    return new Promise((resolve, reject) => {
      this.imap.search(criteria, (err, uids) => {
        if (err) reject(err);
        else resolve(uids || []);
      });
    });
  }

  async processEmail(uid) {
    return new Promise((resolve, reject) => {
      const fetch = this.imap.fetch(uid, { bodies: '' });
      
      fetch.on('message', (msg) => {
        msg.on('body', async (stream) => {
          try {
            const parsed = await simpleParser(stream);
            await this.saveEmailToDatabase(parsed);
            
            // Mark as seen
            this.imap.addFlags(uid, ['\\Seen'], (err) => {
              if (err) console.error('Error marking email as seen:', err);
            });
            
            resolve();
          } catch (error) {
            console.error('Error parsing email:', error);
            reject(error);
          }
        });
      });

      fetch.once('error', reject);
    });
  }

  async saveEmailToDatabase(parsedEmail) {
    try {
      // Extract recipient email from the 'to' field
      const recipientEmail = this.extractRecipientEmail(parsedEmail.to);
      
      if (!recipientEmail) {
        console.log('No valid recipient email found');
        return;
      }

      // Check if this email address exists in our temporary emails
      const emailRecord = await database.db.get(
        'SELECT * FROM emails WHERE email_address = ? AND is_active = 1 AND expires_at > datetime("now")',
        [recipientEmail]
      );

      if (!emailRecord) {
        console.log(`Email address ${recipientEmail} not found or expired`);
        return;
      }

      // Save the message
      const messageId = uuidv4();
      const attachments = parsedEmail.attachments ? 
        JSON.stringify(parsedEmail.attachments.map(att => ({
          filename: att.filename,
          contentType: att.contentType,
          size: att.size
        }))) : null;

      await database.db.run(`
        INSERT INTO messages (
          id, email_id, message_id, sender, subject, 
          body_text, body_html, attachments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        messageId,
        emailRecord.id,
        parsedEmail.messageId,
        parsedEmail.from?.text || 'Unknown',
        parsedEmail.subject || 'No Subject',
        parsedEmail.text || '',
        parsedEmail.html || '',
        attachments
      ]);

      console.log(`Email saved for ${recipientEmail}: ${parsedEmail.subject}`);
      
      // Notify connected clients via WebSocket
      this.notifyClients(emailRecord.session_id, {
        type: 'new_email',
        email: recipientEmail,
        message: {
          id: messageId,
          sender: parsedEmail.from?.text || 'Unknown',
          subject: parsedEmail.subject || 'No Subject',
          preview: (parsedEmail.text || '').substring(0, 100),
          received_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error saving email to database:', error);
    }
  }

  extractRecipientEmail(toField) {
    if (!toField) return null;
    
    // Handle both string and object formats
    const emailText = typeof toField === 'string' ? toField : toField.text;
    
    // Extract email from format like "Name <email@domain.com>" or just "email@domain.com"
    const emailMatch = emailText.match(/<([^>]+)>/) || emailText.match(/([^\s<>]+@[^\s<>]+)/);
    
    return emailMatch ? emailMatch[1] : null;
  }

  notifyClients(sessionId, data) {
    // This will be implemented when we add WebSocket support
    console.log(`Notification for session ${sessionId}:`, data);
  }

  async disconnect() {
    if (this.imap && this.isConnected) {
      this.imap.end();
    }
  }
}

export default new EmailService();