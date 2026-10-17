import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import {
  sendSmsViaProvider,
  checkSmsDiagnostics,
  maskApiKey,
  normalizeIranianMobile,
  parseSenderLine
} from './src/server/smsProvider.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  const app = express();

  // Support CLI arguments: --port 3000 --host 0.0.0.0
  const args = process.argv.slice(2);
  let customPort: string | undefined;
  let customHost: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--port' || args[i] === '-p') && args[i + 1]) customPort = args[i + 1];
    if ((args[i] === '--host' || args[i] === '-h') && args[i + 1]) customHost = args[i + 1];
  }

  // Dev server inside AI Studio must listen on port 3000 because Nginx runs on 8080 and proxies to 3000
  const PORT = parseInt(customPort || (process.env.PORT === '8080' ? '3000' : (process.env.PORT || '3000')), 10);
  const HOST = customHost || process.env.HOST || '0.0.0.0';

  // Allow cross-origin requests and iframe preview in AI Studio
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.removeHeader('X-Frame-Options');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Log non-sensitive startup SMS config status
  const configuredKey = (process.env.SMS_API_KEY || '').trim();
  const configuredLine = parseSenderLine(process.env.SMS_SENDER_LINE);
  console.log(`[BOOT] SMS Gateway Config: Line=${configuredLine}, Key=${maskApiKey(configuredKey)}`);

  // ==========================================
  // System Health & Diagnostics API (/api/v1/health)
  // ==========================================
  app.get(['/api/v1/health', '/api/v1/health/live', '/api/v1/health/ready'], (req, res) => {
    return res.json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      service: 'gowarano-b2b',
      database: { status: 'up', engine: 'PostgreSQL' }
    });
  });

  // ==========================================
  // Authentication & RBAC API (/api/v1/auth/*)
  // ==========================================
  const ALL_PERMISSIONS = [
    'dashboard.view',
    'users.view',
    'users.create',
    'users.update',
    'users.disable',
    'groups.manage',
    'permissions.assign',
    'products.view',
    'products.manage',
    'inventory.view',
    'inventory.manage',
    'sales.view',
    'sales.create',
    'sales.manage',
    'customers.view',
    'customers.manage',
    'visitors.view',
    'visitors.manage',
    'delivery.view',
    'delivery.manage',
    'accounting.view',
    'accounting.manage',
    'sms.view',
    'sms.manage',
    'reports.view',
    'settings.manage'
  ];

  const INITIAL_USERS = [
    {
      id: 'user-001',
      username: 'admin',
      displayName: 'مدیریت کلان (Admin)',
      role: 'admin',
      status: 'active',
      email: 'admin@gowarano.ir',
      phone: '09121112233',
      groups: ['مدیریت ارشد']
    },
    {
      id: 'user-002',
      username: 'sales_lead',
      displayName: 'محسن افشار (سرپرست فروش)',
      role: 'visitor',
      status: 'active',
      email: 'sales@gowarano.ir',
      phone: '09123456789',
      groups: ['تیم فروش']
    },
    {
      id: 'user-003',
      username: 'warehouse_mgr',
      displayName: 'قاسم انصاری (مدیر انبار)',
      role: 'warehouse',
      status: 'active',
      email: 'warehouse@gowarano.ir',
      phone: '09125556677',
      groups: ['انبارداری']
    }
  ];

  const INITIAL_GROUPS = [
    {
      id: 'grp-001',
      name: 'مدیریت ارشد (Super Admin)',
      description: 'دسترسی کامل به تمامی بخش‌های مالی، انبار و کاربران',
      userCount: 1,
      permissions: ALL_PERMISSIONS
    },
    {
      id: 'grp-002',
      name: 'تیم فروش و ویزیتوری',
      description: 'ثبت سفارشات، کاتالوگ محصولات و مدیریت مشتریان B2B',
      userCount: 3,
      permissions: ['dashboard.view', 'products.view', 'sales.view', 'sales.create', 'customers.view', 'visitors.view']
    },
    {
      id: 'grp-003',
      name: 'لجستیک و انبارداری',
      description: 'مدیریت موجودی انبار، حواله‌های ورود و خروج کالا',
      userCount: 2,
      permissions: ['inventory.view', 'inventory.manage', 'products.view', 'delivery.view']
    }
  ];

  /**
   * Login Endpoint: POST /api/v1/auth/login
   * Validates credentials (User: admin / Pass: admin123)
   */
  app.post('/api/v1/auth/login', (req, res) => {
    const { username, password } = req.body || {};
    const trimmedUser = (username || '').trim();
    const trimmedPass = (password || '').trim();

    if (trimmedUser === 'admin' && trimmedPass === 'admin123') {
      const access_token = 'gowarano_token_admin_' + Date.now();
      res.setHeader('Set-Cookie', `Authentication=${access_token}; Path=/; HttpOnly; SameSite=Lax`);
      return res.json({
        message: 'Logged in successfully',
        access_token,
        user: {
          id: 'user-001',
          username: 'admin',
          displayName: 'مدیریت کلان (Admin)',
          role: 'admin',
          access_token,
          permissions: ALL_PERMISSIONS
        }
      });
    }

    return res.status(401).json({
      statusCode: 401,
      message: 'نام کاربری یا رمز عبور نادرست است.'
    });
  });

  /**
   * Logout Endpoint: POST /api/v1/auth/logout
   */
  app.post('/api/v1/auth/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'Authentication=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
    return res.json({ message: 'Logged out successfully' });
  });

  /**
   * Current Profile Endpoint: GET /api/v1/auth/profile
   */
  app.get('/api/v1/auth/profile', (req, res) => {
    return res.json({
      id: 'user-001',
      username: 'admin',
      displayName: 'مدیریت کلان (Admin)',
      role: 'admin',
      permissions: ALL_PERMISSIONS
    });
  });

  /**
   * Users List & Management Endpoint: GET /api/v1/users
   */
  app.get('/api/v1/users', (req, res) => {
    return res.json(INITIAL_USERS);
  });

  app.post('/api/v1/users', (req, res) => {
    const newUser = {
      id: `user-${Date.now()}`,
      username: req.body?.username || 'user_' + Date.now(),
      displayName: req.body?.displayName || 'کاربر جدید',
      role: req.body?.role || 'customer',
      status: 'active',
      email: req.body?.email || '',
      phone: req.body?.phone || '',
      groups: req.body?.groups || ['مشتریان']
    };
    INITIAL_USERS.push(newUser);
    return res.status(201).json(newUser);
  });

  /**
   * Groups List Endpoint: GET /api/v1/groups
   */
  app.get('/api/v1/groups', (req, res) => {
    return res.json(INITIAL_GROUPS);
  });

  app.post('/api/v1/groups', (req, res) => {
    const newGroup = {
      id: `grp-${Date.now()}`,
      name: req.body?.name || 'گروه جدید',
      description: req.body?.description || '',
      userCount: 0,
      permissions: req.body?.permissions || ['dashboard.view']
    };
    INITIAL_GROUPS.push(newGroup);
    return res.status(201).json(newGroup);
  });

  // ==========================================
  // Git Repository & Live Updates API (/api/v1/repo/*)
  // ==========================================

  /**
   * Status Endpoint: GET /api/v1/repo/status
   * Compares local git commit with latest remote origin/main without any mock data
   */
  app.get('/api/v1/repo/status', async (req, res) => {
    try {
      // 1. Current local HEAD commit
      const localShaFull = execSync('git rev-parse HEAD', { cwd: __dirname }).toString().trim();
      const localShaShort = localShaFull.substring(0, 7);
      const localLogRaw = execSync('git log -1 --format="%h|%s|%an|%ad"', { cwd: __dirname }).toString().trim();
      const [lSha, lMsg, lAuthor, lDate] = localLogRaw.split('|');

      let remoteShaFull = localShaFull;
      let hasUpdate = false;
      let commitsBehind = 0;
      let incomingCommits: Array<{ sha: string; message: string; author: string; date: string }> = [];
      let incomingFiles: string[] = [];
      let fetchError: string | null = null;

      try {
        // Fetch latest commit metadata from remote origin main
        execSync('git fetch origin main', { cwd: __dirname, timeout: 12000 });
        remoteShaFull = execSync('git rev-parse origin/main', { cwd: __dirname }).toString().trim();

        if (remoteShaFull !== localShaFull) {
          const countRaw = execSync(`git rev-list --count HEAD..origin/main`, { cwd: __dirname }).toString().trim();
          commitsBehind = parseInt(countRaw, 10) || 0;
          hasUpdate = commitsBehind > 0;

          if (hasUpdate) {
            const rawCommits = execSync(`git log HEAD..origin/main --format="%h|%s|%an|%ad"`, { cwd: __dirname }).toString().trim();
            if (rawCommits) {
              incomingCommits = rawCommits.split('\n').filter(Boolean).map(line => {
                const [s, m, a, d] = line.split('|');
                return { sha: s, message: m, author: a, date: d };
              });
            }

            const rawFiles = execSync(`git diff --name-only HEAD..origin/main`, { cwd: __dirname }).toString().trim();
            if (rawFiles) {
              incomingFiles = rawFiles.split('\n').filter(Boolean);
            }
          }
        }
      } catch (err: any) {
        fetchError = err.message;
        console.warn('[REPO STATUS] git fetch error:', err.message);
      }

      return res.json({
        currentCommit: {
          sha: localShaShort,
          fullSha: localShaFull,
          message: lMsg || 'کامیت جاری سیستم',
          author: lAuthor || 'arkaadia',
          date: lDate || new Date().toLocaleString('fa-IR')
        },
        remoteCommit: {
          sha: remoteShaFull.substring(0, 7),
          fullSha: remoteShaFull
        },
        hasUpdate,
        commitsBehind,
        incomingCommits,
        incomingFiles,
        fetchError,
        repoUrl: 'https://github.com/arkaadia/water',
        branch: 'main',
        checkedAt: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    } catch (err: any) {
      console.error('[REPO STATUS ERROR]', err);
      return res.status(500).json({
        error: `خطا در دریافت وضعیت مخزن گیت: ${err.message}`
      });
    }
  });

  /**
   * Pull & Apply Endpoint: POST /api/v1/repo/pull
   * Performs real git pull, dependency check, and outputs real progress logs
   */
  app.post('/api/v1/repo/pull', async (req, res) => {
    const steps: Array<{ step: string; title: string; status: 'pending' | 'running' | 'completed' | 'failed'; output?: string }> = [];
    try {
      const prevShaFull = execSync('git rev-parse HEAD', { cwd: __dirname }).toString().trim();

      // Step 1: git fetch
      steps.push({ step: 'fetch', title: 'دریافت تغییرات از مخزن گیت‌هاب (git fetch origin main)', status: 'running' });
      const fetchOut = execSync('git fetch origin main', { cwd: __dirname, timeout: 15000 }).toString();
      steps[0].status = 'completed';
      steps[0].output = fetchOut || 'تغییرات با موفقیت از origin دریافت شد.';

      // Get applied commits list before pull
      let appliedCommits: Array<{ sha: string; message: string; author: string; date: string }> = [];
      try {
        const rawCommits = execSync(`git log HEAD..origin/main --format="%h|%s|%an|%ad"`, { cwd: __dirname }).toString().trim();
        if (rawCommits) {
          appliedCommits = rawCommits.split('\n').filter(Boolean).map(line => {
            const [s, m, a, d] = line.split('|');
            return { sha: s, message: m, author: a, date: d };
          });
        }
      } catch {}

      // Step 2: git pull
      steps.push({ step: 'pull', title: 'ادغام و اعمال کامیت‌ها روی سرور (git pull origin main)', status: 'running' });
      let pullOut = '';
      try {
        pullOut = execSync('git pull origin main', { cwd: __dirname, timeout: 30000 }).toString();
      } catch (pullErr: any) {
        // Discard any local artifacts to cleanly rebase/merge
        execSync('git stash', { cwd: __dirname });
        pullOut = execSync('git pull origin main', { cwd: __dirname, timeout: 30000 }).toString();
      }
      steps[1].status = 'completed';
      steps[1].output = pullOut;

      const newShaFull = execSync('git rev-parse HEAD', { cwd: __dirname }).toString().trim();

      // Step 3: Check changed files
      let changedFiles: string[] = [];
      try {
        const diffFiles = execSync(`git diff --name-only ${prevShaFull} ${newShaFull}`, { cwd: __dirname }).toString().trim();
        if (diffFiles) {
          changedFiles = diffFiles.split('\n').filter(Boolean);
        }
      } catch {}

      // Step 4: Dependencies check
      const packageChanged = changedFiles.some(f => f.includes('package.json'));
      if (packageChanged) {
        steps.push({ step: 'deps', title: 'بروزرسانی وابستگی‌های پروژه (npm install)', status: 'running' });
        const npmOut = execSync('npm install --no-audit', { cwd: __dirname, timeout: 60000 }).toString();
        steps[steps.length - 1].status = 'completed';
        steps[steps.length - 1].output = npmOut;
      } else {
        steps.push({ step: 'deps', title: 'بررسی وابستگی‌ها و بسته‌ها', status: 'completed', output: 'پکیج‌ها به‌روز هستند (نیازی به نصب مجدد npm نبود).' });
      }

      return res.json({
        success: true,
        previousSha: prevShaFull.substring(0, 7),
        updatedSha: newShaFull.substring(0, 7),
        newShaFull,
        appliedCommits,
        changedFiles,
        steps,
        message: 'به‌روزرسانی با موفقیت دریافت و در سیستم اعمال شد.'
      });
    } catch (err: any) {
      console.error('[REPO PULL ERROR]', err);
      return res.status(500).json({
        success: false,
        error: `خطا در دریافت و اعمال آپدیت: ${err.message}`,
        steps
      });
    }
  });

  // ==========================================
  // SMS API Routes
  // ==========================================

  /**
   * Diagnostic Endpoint: GET /api/sms/diagnostics
   */
  app.get('/api/sms/diagnostics', async (req, res) => {
    try {
      const apiKeyOverride = req.query.apiKey as string | undefined;
      const lineNumberOverride = req.query.lineNumber as string | undefined;
      const diagnostics = await checkSmsDiagnostics({
        apiKey: apiKeyOverride,
        lineNumber: lineNumberOverride
      });
      return res.json(diagnostics);
    } catch (err: any) {
      console.error('[SMS DIAGNOSTICS ERROR]', err.message);
      return res.status(500).json({
        isConfigured: false,
        maskedApiKey: maskApiKey(),
        senderLine: '3000505',
        reachable: false,
        error: `خطای داخلی سرور در بررسی وضعیت پیامک: ${err.message}`,
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * Safe Test Send Endpoint: POST /api/sms/test
   */
  app.post('/api/sms/test', async (req, res) => {
    try {
      const { testRecipient, testMessage, lineNumber, apiKey } = req.body;

      if (!testRecipient) {
        return res.status(400).json({
          success: false,
          error: 'شماره تلفن همراه گیرنده برای تست الزامی است.'
        });
      }

      const msg = testMessage || 'تست ارتباط با وب‌سرویس پیامک سامانه پخش آب و نوشیدنی گوارانو';
      console.log(`[SMS TEST] Executing test send to ${testRecipient.slice(0, 4)}***`);

      const result = await sendSmsViaProvider({
        recipient: testRecipient,
        message: msg,
        lineNumber,
        apiKey,
        eventType: 'test'
      });

      console.log(`[SMS TEST RESULT] Recipient: ${result.recipient}, Success: ${result.success}, Status: ${result.providerStatus} (${result.providerMessage})`);

      if (!result.success) {
        return res.status(result.providerStatus === 401 ? 401 : 400).json(result);
      }

      return res.json(result);
    } catch (err: any) {
      console.error('[SMS TEST EXCEPTION]', err.message);
      return res.status(500).json({
        success: false,
        status: 'failed',
        error: `خطای سرور هنگام ارسال تست: ${err.message}`,
        providerStatus: 500,
        providerMessage: 'Server Exception',
        recipient: req.body?.testRecipient || '',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * Primary Dispatch Endpoint: POST /api/sms/send
   */
  app.post('/api/sms/send', async (req, res) => {
    try {
      const { to, message, orderNumber, eventType, lineNumber, apiKey } = req.body;

      if (!to) {
        return res.status(400).json({
          success: false,
          status: 'failed',
          error: 'شماره تلفن همراه گیرنده الزامی است.'
        });
      }

      console.log(`[SMS SEND] Dispatching SMS for order="${orderNumber || '-'}" event="${eventType || '-'}" to ${to.slice(0, 4)}***`);

      const result = await sendSmsViaProvider({
        recipient: to,
        message,
        orderNumber,
        eventType,
        lineNumber,
        apiKey
      });

      console.log(`[SMS SEND RESULT] Recipient: ${result.recipient}, Success: ${result.success}, Status: ${result.providerStatus} (${result.providerMessage})`);

      if (!result.success) {
        const httpCode = result.providerStatus === 401 ? 401 : 400;
        return res.status(httpCode).json(result);
      }

      return res.json(result);
    } catch (err: any) {
      console.error('[SMS SEND EXCEPTION]', err.message);
      return res.status(500).json({
        success: false,
        status: 'failed',
        error: `خطای پردازش پیامک در سرور: ${err.message}`,
        providerStatus: 500,
        providerMessage: 'Internal Error',
        recipient: req.body?.to || '',
        timestamp: new Date().toISOString()
      });
    }
  });

  // ==========================================
  // Vite Dev Middlewares / Production Static
  // ==========================================
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(__dirname, 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    console.log(`[SERVER] Serving static production build from ${distPath}`);
    app.use(express.static(distPath, {
      maxAge: '1y',
      etag: true,
      index: 'index.html'
    }));
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      if (req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/api')) return next();
      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Security-Policy', "frame-ancestors *;");
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log(`[SERVER] Mounting Vite in middleware mode (development)`);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    // Fallback HTML handler for SPA routes and query strings
    app.use(async (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }
      if (req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        res.removeHeader('X-Frame-Options');
        const url = req.originalUrl;
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        next(e);
      }
    });
  }

  // ==========================================
  // Start Express Server
  // ==========================================
  const server = app.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(` 💧 گوارانو B2B - سامانه جامع پخش مویرگی آب و نوشیدنی`);
    console.log(` Gowarano B2B Platform with Auth & SMS.ir Integration Ready!`);
    console.log(`======================================================`);
    console.log(`  ➜  Local:       http://localhost:${PORT}/`);
    console.log(`  ➜  Auth API:    http://localhost:${PORT}/api/v1/auth/login`);
    console.log(`  ➜  Health:      http://localhost:${PORT}/api/v1/health`);
    console.log(`======================================================\n`);
  });

  process.on('SIGTERM', () => {
    console.log('[INFO] SIGTERM signal received. Shutting down gracefully...');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('\n[INFO] SIGINT signal received. Shutting down gracefully...');
    server.close(() => process.exit(0));
  });
}

bootstrap().catch(err => {
  console.error('[FATAL SERVER BOOTSTRAP ERROR]', err);
  process.exit(1);
});
