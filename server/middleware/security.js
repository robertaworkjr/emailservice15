import { RateLimiterMemory } from 'rate-limiter-flexible';
import validator from 'validator';

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 || 900, // 15 minutes
});

export const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      retryAfter: secs
    });
  }
};

// Session validation
export const validateSession = (req, res, next) => {
  const sessionId = req.query.sessionId || req.body.sessionId;
  
  if (!sessionId || !validator.isUUID(sessionId)) {
    return res.status(400).json({
      success: false,
      error: 'Valid session ID required'
    });
  }
  
  next();
};

// Input sanitization
export const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = validator.escape(req.body[key]);
    }
  }
  
  for (const key in req.query) {
    if (typeof req.query[key] === 'string') {
      req.query[key] = validator.escape(req.query[key]);
    }
  }
  
  next();
};

export { rateLimiterMiddleware as rateLimiter };