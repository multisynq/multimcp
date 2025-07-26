import express from "express";

/**
 * Security headers middleware for production
 * Implements OWASP recommended security headers
 */
export const securityHeaders = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  // Prevent clickjacking attacks
  res.setHeader("X-Frame-Options", "DENY");
  
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  
  // Enable XSS protection (legacy browsers)
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Control referrer information
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Next.js
    "style-src 'self' 'unsafe-inline'", // Required for styled components
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://mcp.multisynq.io wss://mcp.multisynq.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  res.setHeader("Content-Security-Policy", cspDirectives.join("; "));
  
  // Strict Transport Security (HSTS) - only on HTTPS
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  
  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  
  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");
  
  next();
};

/**
 * Remove sensitive headers that might leak information
 */
export const removeSensitiveHeaders = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  // Remove headers that might reveal server information
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");
  
  // Add a generic server header if needed
  res.setHeader("Server", "metamcp");
  
  next();
};

/**
 * CORS security configuration for production
 * This is a more restrictive CORS setup for specific routes
 */
export const restrictiveCors = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      "https://mcp.multisynq.io",
      "https://multisynq.io",
      "https://www.multisynq.io",
    ];
    
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV === "development") {
      // Allow localhost in development
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}; 