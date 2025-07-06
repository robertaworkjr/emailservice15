# 15-Minute Email Service

A secure temporary email service that provides disposable email addresses that self-destruct after 15 minutes. Perfect for testing, verifying accounts, or protecting your primary email from spam.

## Features

- Generate temporary email addresses
- 15-minute auto-destruction timer
- Real-time inbox monitoring with WebSocket support
- Clean, modern UI with responsive design
- Built with React and Tailwind CSS
- SEO optimized with meta tags and structured data
- Mobile-responsive design
- Social media sharing optimized
- **Real email handling with IMAP/SMTP integration**
- **SQLite database for email storage**
- **WebSocket real-time notifications**
- **Rate limiting and security features**

## Architecture

### Frontend (React + Vite)
- Modern React application with Tailwind CSS
- Real-time WebSocket connection for instant email notifications
- Responsive design with mobile-first approach
- SEO optimized with comprehensive meta tags

### Backend (Node.js + Express)
- RESTful API for email management
- IMAP integration for receiving real emails
- SQLite database for email storage
- WebSocket server for real-time notifications
- Rate limiting and security middleware
- Automatic cleanup of expired emails

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- Your own domain with email hosting
- IMAP/SMTP access to your email server

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd 15-minute-email
npm run setup
```

### 2. Configure Environment Variables

#### Frontend (.env)
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

#### Backend (server/.env)
```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your email server details:
```env
# Email Server Configuration
IMAP_HOST=imap.yourdomain.com
IMAP_PORT=993
IMAP_USER=catchall@yourdomain.com
IMAP_PASSWORD=your-email-password
IMAP_TLS=true

# Domain Configuration
EMAIL_DOMAIN=yourdomain.com

# Database and other settings...
```

### 3. Email Server Setup

You'll need:
1. **Domain with email hosting** (e.g., cPanel, Plesk, or custom mail server)
2. **Catch-all email setup** to receive emails for any address @yourdomain.com
3. **IMAP access** enabled for the catch-all account

#### Recommended Email Server Configuration:
- Set up a catch-all email that forwards all emails to a single inbox
- Create an IMAP user account for the backend to monitor
- Ensure IMAP/SMTP ports are accessible (993 for IMAP, 587 for SMTP)

### 4. Development

Run both frontend and backend:
```bash
npm run dev:full
```

Or run separately:
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend  
npm run server:dev
```

### 5. Production Deployment

#### Frontend
```bash
npm run build
# Deploy dist/ folder to your web server
```

#### Backend
```bash
cd server
npm install --production
npm start
```

## API Endpoints

### Email Management
- `POST /api/email/generate` - Generate new temporary email
- `GET /api/email/:email/messages` - Get messages for email address
- `PATCH /api/message/:id/read` - Mark message as read

### Health & Status
- `GET /api/health` - Backend health check
- `GET /health` - Detailed service status

## WebSocket Events

### Client → Server
- `register` - Register client with session ID
- `ping` - Connection health check

### Server → Client  
- `new_email` - New email received notification
- `registered` - Registration confirmation
- `pong` - Ping response

## Database Schema

### emails
- `id` - Unique email record ID
- `email_address` - Generated temporary email
- `created_at` - Creation timestamp
- `expires_at` - Expiration timestamp
- `session_id` - Client session identifier

### messages
- `id` - Unique message ID
- `email_id` - Reference to emails table
- `sender` - Email sender address
- `subject` - Email subject
- `body_text` - Plain text content
- `body_html` - HTML content
- `received_at` - Received timestamp
- `attachments` - JSON array of attachments

## Security Features

- Rate limiting (100 requests per 15 minutes)
- Input sanitization and validation
- CORS protection
- Helmet security headers
- Session-based email access control
- Automatic cleanup of expired data

## Monitoring & Maintenance

### Automatic Cleanup
- Expired emails are automatically deleted every 5 minutes
- Configurable cleanup interval via `CLEANUP_INTERVAL_MINUTES`

### Health Monitoring
- `/health` endpoint provides service status
- WebSocket connection monitoring
- Database connection status

## Troubleshooting

### Backend Not Connecting
1. Check IMAP credentials in `server/.env`
2. Verify IMAP server allows connections
3. Check firewall settings for IMAP port (993)

### No Emails Received
1. Verify catch-all email is configured
2. Check IMAP inbox for new messages
3. Review backend logs for IMAP errors

### WebSocket Issues
1. Check CORS settings match frontend URL
2. Verify WebSocket port is accessible
3. Check browser console for connection errors

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT License - see LICENSE file for details

## Contact

For support or questions:
- Email: 15minuteemailservice@gmail.com
- Issues: GitHub Issues page