const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const { PORT, NODE_ENV, FRONTEND_URL, ALLOWED_ORIGINS, ADMIN_EMAIL, ADMIN_PASSWORD } = require('./config/env');
const prisma = require('./models/prisma');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const advisorRoutes = require('./routes/advisorRoutes');
const workItemRoutes = require('./routes/workItemRoutes');
const wirePhotoRoutes = require('./routes/wirePhotoRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// 1. Trust Reverse Proxy (Render HTTPS termination)
app.set('trust proxy', 1);

// 2. Security Headers via Helmet with CSP allowing Tailwind CDN, Google Fonts, Cloudinary, and Video Hosts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com"
        ],
        scriptSrcAttr: [
          "'unsafe-inline'"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com",
          "https://lh3.googleusercontent.com",
          "https://images.unsplash.com",
          "https://*.googleusercontent.com"
        ],
        mediaSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com",
          "https://*.googleusercontent.com"
        ],
        frameSrc: [
          "'self'",
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
          "https://drive.google.com",
          "https://player.vimeo.com"
        ],
        connectSrc: [
          "'self'",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
          "https://res.cloudinary.com",
          ...(ALLOWED_ORIGINS || FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean)
        ]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// 3. CORS — Dynamic origin validation with host matching, ALLOWED_ORIGINS, and credentials:true
const defaultLocalOrigins = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'https://themediamoversnist.onrender.com',
  'http://themediamoversnist.onrender.com'
];

const envOrigins = (ALLOWED_ORIGINS || FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const allowedOriginsList = Array.from(new Set([...envOrigins, ...defaultLocalOrigins]));

function normalizeOrigin(origin) {
  if (!origin) return '';
  return origin.trim().replace(/\/+$/, '').toLowerCase();
}

const normalizedConfiguredOrigins = allowedOriginsList.map(normalizeOrigin);

const corsOptionsDelegate = (req, callback) => {
  const origin = req.header('Origin');
  const allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'];
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

  // 1. Requests with no Origin header (e.g. mobile apps, curl, same-site navigation) must be allowed
  if (!origin) {
    return callback(null, {
      origin: true,
      credentials: true,
      methods,
      allowedHeaders
    });
  }

  const normOrigin = normalizeOrigin(origin);

  // 2. Always allow requests whose Origin matches the server's own host or onrender domain
  let isAllowedOrigin = false;
  const reqHost = req.get('host'); // e.g. "themediamoversnist.onrender.com" or "localhost:5000"
  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.host.toLowerCase();
    const originHostname = originUrl.hostname.toLowerCase();

    if (
      (reqHost && (originHost === reqHost.toLowerCase() || originHostname === req.hostname.toLowerCase())) ||
      originHostname === 'themediamoversnist.onrender.com' ||
      originHostname.endsWith('.onrender.com') ||
      originHostname === 'localhost' ||
      originHostname === '127.0.0.1'
    ) {
      isAllowedOrigin = true;
    }
  } catch (_) {}

  // 3. Check against configured allowed origins
  if (normalizedConfiguredOrigins.includes(normOrigin)) {
    isAllowedOrigin = true;
  }

  if (isAllowedOrigin) {
    callback(null, {
      origin: true,
      credentials: true,
      methods,
      allowedHeaders
    });
  } else {
    // 4. Log which origin was blocked and what the allowed list is (no secrets)
    console.warn(`[CORS Blocked] Origin "${origin}" rejected. Allowed origins: [${allowedOriginsList.join(', ')}]. Server host: "${reqHost || 'unknown'}".`);
    callback(new Error(`CORS policy rejection: Origin ${origin} not permitted.`));
  }
};

app.use(cors(corsOptionsDelegate));
app.options('*', cors(corsOptionsDelegate));

// 4. Body Parsing & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 5. Static Uploads Folder (for local uploads fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Mount API Routes — High Priority (mounted BEFORE static files)
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/work-items', workItemRoutes);
app.use('/api/wire-photos', wirePhotoRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/upload', uploadRoutes);

// 7. Serve Frontend Statically — Same origin as API
const frontendPath = path.join(__dirname, '../frontend');
console.log(`[Static] Serving frontend from: ${frontendPath}`);

// Backward-compatibility aliases for legacy static asset paths
app.use('/team', express.static(path.join(frontendPath, 'assets/images')));
app.use('/team', express.static(path.join(frontendPath, 'assets/videos')));
app.use('/member', express.static(path.join(frontendPath, 'assets/images')));
app.use('/team', express.static(path.join(__dirname, '../team')));
app.use('/member', express.static(path.join(__dirname, '../member')));

// Explicit Admin dashboard route
app.get('/admin.html', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(frontendPath, 'admin.html'));
});

// Explicit Root route
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Serve all static frontend files
app.use(
  express.static(frontendPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  })
);

// SPA Fallback for any client-side routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 8. Centralized Error Handler
app.use(errorHandler);

// Helper: Ensure initial admin user exists from environment variables on startup
// Creates admin user ONLY if no admin exists, never creates sample data, never prints passwords
async function ensureAdminUser() {
  try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.log('[Auth] Notice: ADMIN_EMAIL or ADMIN_PASSWORD not set in environment.');
      return;
    }
    const targetEmail = ADMIN_EMAIL.toLowerCase().trim();
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: targetEmail }
    });
    if (!existingAdmin) {
      const anyAdmin = await prisma.adminUser.findFirst();
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      if (anyAdmin) {
        await prisma.adminUser.update({
          where: { id: anyAdmin.id },
          data: { email: targetEmail, passwordHash }
        });
        console.log(`[Auth] Updated existing admin user email to: ${targetEmail}`);
      } else {
        await prisma.adminUser.create({
          data: {
            email: targetEmail,
            passwordHash
          }
        });
        console.log(`[Auth] Initialized admin user: ${targetEmail}`);
      }
    } else {
      console.log(`[Auth] Admin user verified: ${targetEmail}`);
    }
  } catch (err) {
    console.warn('[DB] Notice: Could not verify admin user on startup:', err.message);
  }
}

// Start Server — Bind to 0.0.0.0 and process.env.PORT
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, async () => {
  console.log(`====================================================`);
  console.log(` MediaMovers Web Service — ${NODE_ENV} mode`);
  console.log(` Listening on: http://${HOST}:${PORT}`);
  console.log(``);
  console.log(` Public site:  http://localhost:${PORT}/`);
  console.log(` Admin panel:  http://localhost:${PORT}/admin.html`);
  console.log(` API health:   http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
  await ensureAdminUser();
});

module.exports = { app, server };
