// Email generation and validation utilities
class EmailError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EmailError';
  }
}

export function validateEmail(email) {
  const regex = /^[a-z0-9]+@15min\.mail$/;
  if (!regex.test(email)) {
    throw new EmailError('Invalid temporary email format');
  }
  return true;
}

export function generateEmail() {
  // Directly return the communication email
  const email = '15minuteemailservice@gmail.com';
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

function generateRandomSubject() {
  const subjects = [
    'Welcome to your temporary email',
    'Your account verification',
    'Sign up confirmation',
    'Your one-time password',
    'Security code',
    'Verification required',
    'Your authentication code',
    'Important: Please verify your email',
    'Your login credentials',
    'Temporary access code'
  ];
  return subjects[Math.floor(Math.random() * subjects.length)];
}

function generateRandomBody() {
  const bodies = [
    'Here is your verification code: ',
    'Your one-time password is: ',
    'Please use this code to complete your registration: ',
    'Enter this security code to continue: ',
    'Your authentication code is: '
  ];
  const body = bodies[Math.floor(Math.random() * bodies.length)];
  const code = generateRandomString(6).toUpperCase();
  return {
    text: body + code,
    code: code
  };
}

export function generateMockEmail() {
  const timestamp = new Date();
  const { text: body, code } = generateRandomBody();
  
  return {
    id: generateRandomString(12),
    subject: generateRandomSubject(),
    from: 'noreply@service.com',
    preview: body.substring(0, 50) + (body.length > 50 ? '...' : ''),
    body: body,
    code: code,
    time: formatTimestamp(timestamp),
    timestamp: timestamp.toISOString()
  };
}
