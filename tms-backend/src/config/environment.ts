// THIS IS THE DOCKER VERSION OF THE ENVIRONMENT
export const config = {

  // application environment mode
  environment: process.env.ENVIRONMENT || "production",

  // host domain options
  protocol: process.env.PROTOCOL || 'http',
  host: process.env.HOST || "localhost",
  exposedPort: process.env.EXPOSED_PORT, // TODO: Change EXPOSED_PORT
  port: process.env.PORT, // !Do NOT change this option, because it is used by reverse-proxy

  // MongoDB connection options
  mongo: {
    uri: `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/?authSource=admin`,
    options: {
      dbName: process.env.DB_NAME,
      user: process.env.DB_ROOT_USERNAME,
      pass: process.env.DB_ROOT_PASSWORD,
    }
  },

  // Session options
  session: {
    secret: process.env.SESSION_SECRET as any,
    saveUninitialized: false,
    resave: true,
    rolling: true, //the session identifier cookie will expire in maxAge since the last response was sent
    cookie: {
      maxAge: parseInt(process.env.SESSION_MAX_AGE as any)
    }
  },

  // Limiters for ddos attack prevention
  apiLimiter: {
    windowMs: 3*60*1000,    // 3 minutes
    max: 300,               // limit each IP to 300 requests per windowMs (for each route)
    message: "Too many requests!"
  },
  authLimiter: {
    windowMs: 1*60*1000,    // 1 minute
    max: 10,               // limit each IP to 10 requests per windowMs (for auth route)
    message: "Too many requests!"
  },
  notifLimiter: {
    windowMs: 3*60*1000,    // 5 minutes
    max: 500,               // limit each IP to 500 requests per windowMs
    message: "Too many requests!"
  }
};


/**
 * Indicates whether process is in production mode
 *
 * @export
 * @returns {boolean}
 */
export function isProd(): boolean {
  return config.environment === 'production';
}

/**
 * Indicates whether process is in development mode
 *
 * @export
 * @returns {boolean}
 */
export function isDev(): boolean {
  return config.environment === 'development';
}

/**
 * Get full host domain
 * e.g. http://localhost:8080
 *
 * @export
 * @returns {string}
 */
export function getHostDomain(): string {
  return `${config.protocol}://${config.host}:${config.exposedPort}`;
}
