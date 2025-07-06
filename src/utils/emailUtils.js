// Email generation and validation utilities
class EmailError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EmailError';
  }
}

export function validateEmail(email) {
  console.log('Validating email:', email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  console.log('Is email valid:', isValid);
  if (!isValid) {
    console.error('Invalid email format:', email);
    throw new EmailError('Invalid email format');
  }
  return true;
}

export function generateEmail() {
  // Generate a more realistic random username
  const adjectives = ['quick', 'bright', 'cool', 'smart', 'fast', 'blue', 'red', 'green'];
  const nouns = ['fox', 'cat', 'dog', 'bird', 'fish', 'star', 'moon', 'sun'];
  const numbers = Math.floor(Math.random() * 999) + 1;
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const username = `${adjective}${noun}${numbers}`;
  
  const email = `${username}@15min.mail`;
  validateEmail(email);
  return email;
}

export function formatTimestamp(date) {
  try {
    const now = new Date();
    const timestamp = date || now;
    
    if (timestamp.toDateString() === now.toDateString()) {
      return timestamp.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return timestamp.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Just now';
  }
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateRandomSubject() {
  const subjects = [
    'Welcome to your temporary email',
    'Your account verification code',
    'Sign up confirmation required',
    'Your one-time password is ready',
    'Security verification code',
    'Please verify your email address',
    'Your authentication code',
    'Important: Email verification needed',
    'Your login credentials are ready',
    'Temporary access code generated',
    'Newsletter subscription confirmation',
    'Password reset request',
    'Account activation required',
    'Two-factor authentication code'
  ];
  return subjects[Math.floor(Math.random() * subjects.length)];
}

function generateRandomSender() {
  const senders = [
    'noreply@service.com',
    'support@platform.io',
    'verify@accounts.net',
    'security@authservice.com',
    'notifications@webapp.co',
    'admin@testsite.org',
    'info@newsletter.com',
    'alerts@system.net'
  ];
  return senders[Math.floor(Math.random() * senders.length)];
}

function generateRandomBody() {
  const templates = [
    {
      intro: 'Thank you for signing up! Here is your verification code: ',
      outro: '\n\nThis code will expire in 10 minutes. Please do not share this code with anyone.'
    },
    {
      intro: 'Your one-time password is: ',
      outro: '\n\nUse this code to complete your login. If you did not request this, please ignore this email.'
    },
    {
      intro: 'Please use this security code to verify your account: ',
      outro: '\n\nFor your security, this code is only valid for 15 minutes.'
    },
    {
      intro: 'Your authentication code is: ',
      outro: '\n\nEnter this code in the application to continue. Keep this code confidential.'
    },
    {
      intro: 'Welcome! Complete your registration with this code: ',
      outro: '\n\nOnce verified, you\'ll have full access to all features.'
    }
  ];
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  const code = generateRandomString(6).toUpperCase();
  const fullBody = template.intro + code + template.outro;
  
  return {
    text: fullBody,
    code: code,
    preview: template.intro + code
  };
}

export function generateMockEmail() {
  const timestamp = new Date();
  const { text: body, code, preview } = generateRandomBody();
  
  return {
    id: generateRandomString(12),
    subject: generateRandomSubject(),
    from: generateRandomSender(),
    preview: preview.substring(0, 80) + (preview.length > 80 ? '...' : ''),
    body: body,
    code: code,
    time: formatTimestamp(timestamp),
    timestamp: timestamp.toISOString(),
    attachments: Math.random() > 0.8 ? [
      { name: 'verification.pdf' },
      { name: 'terms.txt' }
    ] : []
  };
}