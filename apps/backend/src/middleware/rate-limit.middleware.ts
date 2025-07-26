import express from "express";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Simple in-memory rate limiter
// For production, consider using Redis-based solution
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default: 1 minute)
  max?: number; // Max requests per window (default: 100)
  message?: string; // Error message
  keyGenerator?: (req: express.Request) => string; // Custom key generator
}

export const createRateLimitMiddleware = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 100,
    message = "Too many requests, please try again later.",
    keyGenerator = (req) => req.ip || "unknown",
  } = options;

  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
      // Create new entry or reset existing one
      entry = {
        count: 1,
        resetAt: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    } else {
      // Increment count
      entry.count++;
    }

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", max.toString());
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - entry.count).toString());
    res.setHeader("X-RateLimit-Reset", new Date(entry.resetAt).toISOString());

    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000).toString());
      return res.status(429).json({
        error: "Rate limit exceeded",
        message,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      });
    }

    next();
  };
};

// Pre-configured rate limiters for different use cases
export const publicEndpointRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Too many requests to public endpoints. Please try again later.",
});

export const strictRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: "Rate limit exceeded. Please slow down your requests.",
});

export const toolExecutionRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 tool executions per minute
  message: "Too many tool execution requests. Please try again later.",
  keyGenerator: (req) => {
    // Rate limit by API key if available, otherwise by IP
    const apiKeyHeader = req.headers["x-api-key"];
    const apiKey = typeof apiKeyHeader === "string" ? apiKeyHeader : req.headers.authorization?.substring(7);
    return apiKey || req.ip || "unknown";
  },
}); 