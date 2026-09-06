const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const dotenv = require('dotenv');
const crypto = require('crypto');
const twilio = require('twilio');

const envPath = path.join(__dirname, '.env');
const loadEnv = () => {
  dotenv.config({ path: envPath });
};
loadEnv();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const fssync = require('fs');

app.disable('x-powered-by');

const CONTENT_FILE = path.join(__dirname, 'data', 'site-content.json');
const STAFF_TOUR_FILE = path.join(__dirname, 'data', 'staff-tour.json');
const ACTIVITY_LOG_FILE = path.join(__dirname, 'data', 'admin-activity-log.json');
const SLIDES_DIR = path.join(__dirname, 'slides');
const BILLBOARD_DIR = path.join(__dirname, 'billbord');
const MEDIA_TYPES = {
  image: /\.(jpe?g|png|gif|webp|bmp)$/i,
  video: /\.(mp4|webm|ogg|mov)$/i,
  audio: /\.(mp3|wav|ogg|m4a|aac)$/i,
  presentation: /\.(ppt|pptx)$/i,
};
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'TSHIRELETSO';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Tshire@letso51';
const ADMIN_ACCOUNTS = {
  TSHIRELETSO: {
    password: process.env.IT_PASSWORD || 'Tshire@letso51',
    displayName: 'Tshireletso Timbi',
    role: 'it_specialist',
    allowedSections: null,
  },
  ANNELE: {
    password: process.env.ANNELE_PASSWORD || 'Annele@2026',
    displayName: 'Annele Web Admin',
    role: 'web_admin',
    allowedSections: ['home', 'staff', 'billboard', 'media', 'slides'],
  },
  NONG: {
    password: process.env.ANNELE_PASSWORD || 'Annele@2026',
    displayName: 'Deputy NONG',
    role: 'web_admin',
    allowedSections: ['home', 'staff', 'billboard', 'media', 'slides'],
  },
};

const readJsonFile = async (filePath, fallback) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const writeJsonFile = async (filePath, data) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

const getAdminAccount = (username, password) => {
  const normalized = String(username || '').trim().toUpperCase();
  const entry = ADMIN_ACCOUNTS[normalized];
  if (!entry) {
    return null;
  }
  return entry.password === String(password || '') ? { username: normalized, ...entry } : null;
};

const appendActivityLog = async (entry) => {
  const log = await readJsonFile(ACTIVITY_LOG_FILE, []);
  const nextEntry = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  };
  const updated = [...log, nextEntry].slice(-20);
  await writeJsonFile(ACTIVITY_LOG_FILE, updated);
};

const readSiteContent = async () => {
  return readJsonFile(CONTENT_FILE, {});
};

const getPublicSiteRoot = (req) => {
  const configuredRoot = String(process.env.SITE_ROOT || '').replace(/\/$/, '');
  if (configuredRoot) return configuredRoot;

  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const protocol = forwardedProto || req.protocol || 'http';
  const host = req.get('host');
  if (!host || /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host)) return '';
  return `${protocol}://${host}`;
};

const writeSiteContent = async (data) => {
  await writeJsonFile(CONTENT_FILE, data);
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'admissions-backend', timestamp: new Date().toISOString() });
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'images', 'school-logo.jpg'));
});

app.get('/api/env-status', (req, res) => {
  loadEnv();
  res.json({
    payfast: {
      merchant_id: !!process.env.PAYFAST_MERCHANT_ID,
      merchant_key: !!process.env.PAYFAST_MERCHANT_KEY,
      passphrase: !!process.env.PAYFAST_PASSPHRASE,
      base_url: process.env.PAYFAST_BASE_URL,
      return_url: process.env.PAYFAST_RETURN_URL,
      notify_url: process.env.PAYFAST_NOTIFY_URL,
      cancel_url: process.env.PAYFAST_CANCEL_URL,
    },
    siteRoot: process.env.SITE_ROOT || 'http://127.0.0.1:3000',
    admission_fee: process.env.ADMISSION_FEE || '140.00',
  });
});

app.get('/api/billboard-images', async (req, res) => {
  try {
    await fssync.promises.mkdir(BILLBOARD_DIR, { recursive: true });
    const files = await fs.readdir(BILLBOARD_DIR);
    const imageFiles = files.filter((file) => MEDIA_TYPES.image.test(file));
    const urls = imageFiles.map((file) => `/billbord/${encodeURIComponent(file)}`);
    res.json(urls);
  } catch (error) {
    console.error('Failed to load billboard images:', error);
    res.status(500).json({ error: 'Unable to load billboard images' });
  }
});

app.get('/api/shared-slides', async (req, res) => {
  try {
    const content = await readSiteContent();
    const publicSiteRoot = getPublicSiteRoot(req);
    const mediaDirectories = [BILLBOARD_DIR, SLIDES_DIR];
    const mediaItems = [];
    const seen = new Set();

    for (const dir of mediaDirectories) {
      await fssync.promises.mkdir(dir, { recursive: true });
      const files = await fs.readdir(dir);
      for (const file of files) {
        const kind = Object.entries(MEDIA_TYPES).find(([, pattern]) => pattern.test(file))?.[0];
        if (!kind) {
          continue;
        }
        const relativePath = path.relative(__dirname, path.join(dir, file)).replace(/\\/g, '/');
        const publicPath = `/${relativePath.split('/').map((segment) => encodeURIComponent(segment)).join('/')}`;
        if (!seen.has(publicPath)) {
          seen.add(publicPath);
          mediaItems.push({
            image: publicPath,
            media: publicPath,
            kind,
            fileName: file,
            viewerUrl: kind === 'presentation' && publicSiteRoot
              ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(`${publicSiteRoot}${publicPath}`)}`
              : null,
          });
        }
      }
    }

    const fallbackImage = '/images/School Pics 3/IMG_9013.jpeg';
    const fallbackTitle = content.slideTitle || content.billboardTicker || 'Waterkloof Hills Secondary School';
    const fallbackText = content.slideCaption || content.billboardMessage || 'Developing future leaders with purpose and pride.';
    const slides = (mediaItems.length ? mediaItems : [{ image: fallbackImage, media: fallbackImage, kind: 'image' }]).map((item, index) => ({
      ...item,
      title: fallbackTitle,
      text: (Array.isArray(content.billboardSlides) && content.billboardSlides[index]) || fallbackText,
      note: Array.isArray(content.billboardSlides) ? content.billboardSlides[index] || '' : ''
    }));
    res.json(slides);
  } catch (error) {
    console.error('Failed to load shared slides:', error);
    res.status(500).json({ error: 'Unable to load shared slides' });
  }
});

app.get('/api/site-content', async (req, res) => {
  try {
    const data = await readSiteContent();
    res.json(data);
  } catch (error) {
    console.error('Failed to load site content:', error);
    res.status(500).json({ error: 'Unable to load site content' });
  }
});

app.get('/api/admin/accounts', (req, res) => {
  const accounts = Object.entries(ADMIN_ACCOUNTS).map(([username, meta]) => ({
    username,
    displayName: meta.displayName,
    role: meta.role,
    allowedSections: meta.allowedSections || [],
    passwordHint: username === 'TSHIRELETSO' ? 'Tshire@letso51' : 'Annele@2026',
  }));
  res.json(accounts);
});

app.get('/api/admin/activity-log', async (req, res) => {
  const { username, password } = req.query || {};
  const account = getAdminAccount(username, password);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const log = await readJsonFile(ACTIVITY_LOG_FILE, []);
    res.json(log);
  } catch (error) {
    console.error('Failed to load activity log:', error);
    res.status(500).json({ error: 'Unable to load activity log' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body || {};
  const account = getAdminAccount(username, password);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await appendActivityLog({
    username: account.username,
    displayName: account.displayName,
    role: account.role,
    action: 'login',
    ip: req.ip,
  });

  return res.json({
    success: true,
    user: {
      username: account.username,
      displayName: account.displayName,
      role: account.role,
      allowedSections: account.allowedSections || null,
    },
  });
});

app.post('/api/site-content', async (req, res) => {
  const { username, password } = req.body || {};
  const account = getAdminAccount(username, password);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const data = req.body?.content || {};
    await writeSiteContent(data);
    await appendActivityLog({
      username: account.username,
      displayName: account.displayName,
      role: account.role,
      action: 'saved-content',
      ip: req.ip,
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save site content:', error);
    res.status(500).json({ error: 'Unable to save site content' });
  }
});

app.get('/api/staff-tour', async (req, res) => {
  try {
    const data = await readJsonFile(STAFF_TOUR_FILE, { sections: [] });
    res.json(data);
  } catch (error) {
    console.error('Failed to load staff tour content:', error);
    res.status(500).json({ error: 'Unable to load staff tour content' });
  }
});

app.post('/api/staff-tour', async (req, res) => {
  const { username, password, staffTourData } = req.body || {};
  const account = getAdminAccount(username, password);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await writeJsonFile(STAFF_TOUR_FILE, staffTourData || { sections: [] });
    await appendActivityLog({
      username: account.username,
      displayName: account.displayName,
      role: account.role,
      action: 'updated-staff-tour',
      ip: req.ip,
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save staff tour content:', error);
    res.status(500).json({ error: 'Unable to save staff tour content' });
  }
});

app.get('/api/admin/billboard-media', async (req, res) => {
  const { username, password } = req.query || {};
  const account = getAdminAccount(username, password);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await fssync.promises.mkdir(BILLBOARD_DIR, { recursive: true });
    const files = await fs.readdir(BILLBOARD_DIR);
    const media = [];
    for (const file of files.filter((entry) => Object.values(MEDIA_TYPES).some((pattern) => pattern.test(entry)))) {
      const stats = await fs.stat(path.join(BILLBOARD_DIR, file));
      media.push({
        fileName: file,
        imageUrl: `/billbord/${encodeURIComponent(file)}`,
        kind: Object.entries(MEDIA_TYPES).find(([, pattern]) => pattern.test(file))?.[0] || 'file',
        uploadedAt: stats.mtime.toISOString(),
        size: stats.size,
      });
    }
    res.json(media);
  } catch (error) {
    console.error('Failed to load billboard media:', error);
    res.status(500).json({ error: 'Unable to load billboard media' });
  }
});

app.post('/api/admin/upload-image', upload.single('image'), async (req, res) => {
  const { username, password } = req.body || {};
  const account = getAdminAccount(username, password);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    const billboardDir = BILLBOARD_DIR;
    await fssync.promises.mkdir(billboardDir, { recursive: true });
    const extension = path.extname(req.file.originalname || 'image.png') || '.png';
    const kind = Object.entries(MEDIA_TYPES).find(([, pattern]) => pattern.test(extension))?.[0];
    if (!kind) {
      return res.status(400).json({ error: 'Unsupported billboard media type' });
    }
    const fileName = `${Date.now()}-${String(req.file.originalname || 'image').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const safeName = fileName.endsWith(extension) ? fileName : `${fileName}${extension}`;
    const targetPath = path.join(billboardDir, safeName);
    await fssync.promises.writeFile(targetPath, req.file.buffer);
    await appendActivityLog({
      username: account.username,
      displayName: account.displayName,
      role: account.role,
      action: `uploaded-billboard-${kind}`,
      fileName: safeName,
      ip: req.ip,
    });
    res.json({ success: true, imageUrl: `/billbord/${encodeURIComponent(safeName)}`, kind });
  } catch (error) {
    console.error('Failed to upload billboard image:', error);
    res.status(500).json({ error: 'Unable to upload image' });
  }
});

app.delete('/api/admin/billboard-image', async (req, res) => {
  const { username, password, filename } = req.body || {};
  const account = getAdminAccount(username, password);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!filename) {
    return res.status(400).json({ error: 'No image name provided' });
  }

  try {
    const decodedName = decodeURIComponent(String(filename));
    const safeName = path.basename(decodedName);
    if (!safeName || safeName === '.' || safeName === '..') {
      return res.status(400).json({ error: 'Invalid image name' });
    }

    const targetPath = path.join(BILLBOARD_DIR, safeName);
    if (!fssync.existsSync(targetPath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    await fssync.promises.unlink(targetPath);
    await appendActivityLog({
      username: account.username,
      displayName: account.displayName,
      role: account.role,
      action: 'removed-billboard-image',
      fileName: safeName,
      ip: req.ip,
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to remove billboard image:', error);
    res.status(500).json({ error: 'Unable to remove image' });
  }
});

app.post('/api/admin/upload-staff-image', upload.single('image'), async (req, res) => {
  const { username, password } = req.body || {};
  const account = getAdminAccount(username, password);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    const uploadDir = path.join(__dirname, 'images', 'staff', 'uploads');
    await fssync.promises.mkdir(uploadDir, { recursive: true });
    const extension = path.extname(req.file.originalname || 'staff-image.png') || '.png';
    const safeName = `${Date.now()}-${String(req.file.originalname || 'staff-image').replace(/[^a-zA-Z0-9._-]/g, '_')}${extension}`;
    const targetPath = path.join(uploadDir, safeName);
    await fssync.promises.writeFile(targetPath, req.file.buffer);
    res.json({ success: true, imageUrl: `/images/staff/uploads/${encodeURIComponent(safeName)}` });
  } catch (error) {
    console.error('Failed to upload staff image:', error);
    res.status(500).json({ error: 'Unable to upload staff image' });
  }
});

app.get('/api/presentation-slides', async (req, res) => {
  try {
    await fssync.promises.mkdir(SLIDES_DIR, { recursive: true });
    const files = await fs.readdir(SLIDES_DIR);
    const slides = files.map((file) => ({
      fileName: file,
      fileUrl: `/slides/${encodeURIComponent(file)}`,
      uploadedAt: fssync.statSync(path.join(SLIDES_DIR, file)).mtime.toISOString(),
      size: fssync.statSync(path.join(SLIDES_DIR, file)).size,
    }));
    res.json(slides);
  } catch (error) {
    console.error('Failed to load presentation slides:', error);
    res.status(500).json({ error: 'Unable to load presentation slides' });
  }
});

app.post('/api/admin/upload-slide', upload.single('slide'), async (req, res) => {
  const { username, password } = req.body || {};
  const account = getAdminAccount(username, password);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No slide provided' });
  }

  try {
    await fssync.promises.mkdir(SLIDES_DIR, { recursive: true });
    const extension = path.extname(req.file.originalname || 'slide.pptx') || '.pptx';
    const safeName = `${Date.now()}-${String(req.file.originalname || 'slide').replace(/[^a-zA-Z0-9._-]/g, '_')}${extension}`;
    const targetPath = path.join(SLIDES_DIR, safeName);
    await fssync.promises.writeFile(targetPath, req.file.buffer);
    await appendActivityLog({
      username: account.username,
      displayName: account.displayName,
      role: account.role,
      action: 'uploaded-slide',
      fileName: safeName,
      ip: req.ip,
    });
    res.json({ success: true, fileUrl: `/slides/${encodeURIComponent(safeName)}` });
  } catch (error) {
    console.error('Failed to upload slide:', error);
    res.status(500).json({ error: 'Unable to upload slide' });
  }
});

app.delete('/api/admin/presentation-slide', async (req, res) => {
  const { username, password, filename } = req.body || {};
  const account = getAdminAccount(username, password);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!filename) {
    return res.status(400).json({ error: 'No slide name provided' });
  }

  try {
    const decodedName = decodeURIComponent(String(filename));
    const safeName = path.basename(decodedName);
    const targetPath = path.join(SLIDES_DIR, safeName);
    if (!fssync.existsSync(targetPath)) {
      return res.status(404).json({ error: 'Slide not found' });
    }

    await fssync.promises.unlink(targetPath);
    await appendActivityLog({
      username: account.username,
      displayName: account.displayName,
      role: account.role,
      action: 'removed-slide',
      fileName: safeName,
      ip: req.ip,
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to remove slide:', error);
    res.status(500).json({ error: 'Unable to remove slide' });
  }
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/billboard-admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'billboard-admin.html'));
});

const buildApplicationPdf = (fields) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // header: try to draw logo left and school info center
    const logoPaths = [path.join(__dirname, 'images', 'school-logo.jpg'), path.join(__dirname, 'images', 'logo.jpg'), path.join(__dirname, 'images', 'logo.png')];
    let logoPlaced = false;
    for (const lp of logoPaths) {
      if (fssync.existsSync(lp)) {
        try {
          doc.image(lp, 50, 50, { width: 80 });
          logoPlaced = true;
        } catch (e) {
          // ignore image errors
        }
        break;
      }
    }

    doc.font('Helvetica-Bold').fontSize(18).text('Waterkloof Hills Secondary School', logoPlaced ? 150 : { align: 'center' });
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(11).fillColor('black').text('2 Spain Drive, Waterkloof Ext 5, Rustenburg, 0299', { align: logoPlaced ? 'left' : 'center' });
    doc.moveDown(0.2);
    doc.fontSize(11).text('Tel: 076 809 0560 · Email: admin@waterkloofhillsschool.co.za', { align: logoPlaced ? 'left' : 'center' });

    // horizontal rule
    doc.moveTo(50, 140).lineTo(545, 140).strokeColor('#444444').stroke();

    // title
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(14).text('Admissions Application Summary', { align: 'center' });
    doc.moveDown(0.5);

    // content in two columns
    const leftX = 60;
    const rightX = 320;
    const startY = doc.y + 10;
    let y = startY;

    const addRow = (label, value) => {
      const display = value ? String(value) : 'Not provided';
      doc.font('Helvetica-Bold').fontSize(10).text(label, leftX, y);
      doc.font('Helvetica').fontSize(10).text(display, rightX, y);
      y += 18;
    };

    addRow('Learner full name', fields.learner_name);
    addRow('Date of birth', fields.dob);
    addRow('Applying for grade', fields.grade);
    addRow('Previous school', fields.previous_school);
    addRow('Parent / guardian name', fields.parent_name);
    addRow('Relationship to learner', fields.guardian_relation);
    addRow('Parent phone', fields.parent_phone);
    addRow('Alternate phone', fields.alternate_phone);
    addRow('Parent email', fields.parent_email);
    addRow('Address', fields.address);
    addRow('Residence type', fields.residence_type);

    if (fields.additional) {
      doc.font('Helvetica-Bold').fontSize(10).text('Additional information', leftX, y);
      doc.font('Helvetica').fontSize(10).text(String(fields.additional), leftX, y + 16, { width: 425 });
      y += 36;
    }

    // footer note and signature area
    doc.moveTo(50, 720).lineTo(545, 720).strokeColor('#dddddd').stroke();
    doc.fontSize(9).fillColor('gray').text('This document is generated automatically from the online admissions form. Please retain the reference number for your records.', 50, 730);

    doc.end();
  });
};

const submitApplication = async (req, res) => {
  try {
    const fields = req.body || {};
    const pdfBuffer = await buildApplicationPdf(fields);
    const attachments = [
      {
        filename: `admissions-application-${Date.now()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
      ...((req.files || []).map((file) => ({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype,
      }))),
    ];

    const emailTo = process.env.RECEIVER_EMAIL || 'admin@waterkloofhillsschool.co.za';
    const emailFrom = process.env.SENDER_EMAIL || process.env.SMTP_USER || emailTo;
    const emailSubject = process.env.EMAIL_SUBJECT || 'New Admissions Application';

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const messageLines = [
      'A new admissions form has been submitted from the website.',
      '',
      `Learner name: ${fields.learner_name || ''}`,
      `Date of birth: ${fields.dob || ''}`,
      `Applying for grade: ${fields.grade || ''}`,
      `Previous school: ${fields.previous_school || ''}`,
      `Parent / guardian name: ${fields.parent_name || ''}`,
      `Relation to learner: ${fields.guardian_relation || ''}`,
      `Parent phone: ${fields.parent_phone || ''}`,
      `Alternate phone: ${fields.alternate_phone || ''}`,
      `Parent email: ${fields.parent_email || ''}`,
      `Address: ${fields.address || ''}`,
      `Residence type: ${fields.residence_type || ''}`,
      `Additional information: ${fields.additional || ''}`,
      '',
      'Please see the attached structured PDF summary and supporting documents, if any.',
    ];

    await transporter.sendMail({
      from: emailFrom,
      to: [emailTo, fields.parent_email].filter(Boolean),
      replyTo: fields.parent_email,
      subject: emailSubject,
      text: messageLines.join('\n'),
      html: `<h2>New Admissions Application</h2><p>${messageLines.join('<br>')}</p>`,
      attachments,
    });

    res.redirect('/admissions.html?success=1');
  } catch (error) {
    console.error('Application submission failed:', error);
    res.redirect('/admissions.html?error=1');
  }
};

app.post('/submit-application', upload.any(), submitApplication);
app.post('/api/submit-application', upload.any(), submitApplication);

// Ensure applications directory exists
const applicationsDir = path.join(__dirname, 'applications');
if (!fssync.existsSync(applicationsDir)) {
  fssync.mkdirSync(applicationsDir);
}

// Create application submission record directly (no payment step)
app.post('/api/create-application', upload.any(), async (req, res) => {
  try {
    const fields = req.body || {};

    const required = ['learner_name', 'dob', 'grade', 'parent_name', 'guardian_relation', 'parent_phone', 'parent_email', 'address', 'residence_type'];
    const missing = required.filter((k) => !fields[k] || String(fields[k]).trim() === '');
    if (missing.length) {
      return res.status(400).json({ error: 'Missing required fields', missing });
    }

    const appId = `WHSS-${Date.now()}`;
    const appPath = path.join(applicationsDir, appId);
    await fs.mkdir(appPath, { recursive: true });

    const savedFiles = [];
    for (const file of req.files || []) {
      const dest = path.join(appPath, file.originalname);
      await fs.writeFile(dest, file.buffer);
      savedFiles.push(dest);
    }

    const record = {
      id: appId,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      fields,
      files: savedFiles.map((p) => path.relative(__dirname, p).replace(/\\/g, '/')),
    };

    const reference = 'WHSS' + new Date().getFullYear() + String(Date.now()).slice(-6);
    record.reference = reference;

    await fs.writeFile(path.join(appPath, 'application.json'), JSON.stringify(record, null, 2));

    const pdfBuffer = await buildApplicationPdf(fields);
    const pdfPath = path.join(appPath, `${record.reference}-confirmation.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);

    const emailTo = process.env.RECEIVER_EMAIL || 'admin@waterkloofhillsschool.co.za';
    const emailFrom = process.env.SENDER_EMAIL || process.env.SMTP_USER || emailTo;
    const emailSubject = process.env.EMAIL_SUBJECT || `Admissions Application Submitted: ${record.reference}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const messageLines = [
      'A new admissions form has been submitted.',
      '',
      `Reference: ${record.reference}`,
      `Learner name: ${fields.learner_name || ''}`,
      `Parent email: ${fields.parent_email || ''}`,
    ];

    await transporter.sendMail({
      from: emailFrom,
      to: emailTo,
      subject: emailSubject,
      text: messageLines.join('\n'),
      html: `<h2>Admissions Application Submitted</h2><p>${messageLines.join('<br>')}</p>`,
      attachments: [
        { filename: path.basename(pdfPath), path: pdfPath },
        ...savedFiles.map((filePath) => ({ filename: path.basename(filePath), path: filePath })),
      ],
    });

    return res.json({ success: true, applicationId: appId, reference, message: 'Application submitted successfully.' });
  } catch (err) {
    console.error('Create application failed:', err);
    return res.status(500).json({ error: 'Failed to create application' });
  }
});

// Confirm payment, finalize application (generate PDF, email admin)
// helper to finalize an application record
async function finalizeApplication(appId, record, appPath) {
  record.status = 'paid';
  record.paidAt = new Date().toISOString();

  // generate reference number if not present
  if (!record.reference) {
    record.reference = `WH-${Date.now().toString(36).toUpperCase().slice(-8)}`;
  }

  // generate PDF
  const pdfBuffer = await buildApplicationPdf(record.fields);
  const pdfPath = path.join(appPath, `${record.reference}-confirmation.pdf`);
  await fs.writeFile(pdfPath, pdfBuffer);

  // prepare attachments
  const attachments = [{ filename: path.basename(pdfPath), path: pdfPath }];
  const files = fssync.readdirSync(appPath).filter((f) => f !== path.basename(pdfPath) && f !== 'application.json');
  for (const f of files) attachments.push({ filename: f, path: path.join(appPath, f) });

  const emailTo = process.env.RECEIVER_EMAIL || 'admin@waterkloofhillsschool.co.za';
  const emailFrom = process.env.SENDER_EMAIL || process.env.SMTP_USER || emailTo;
  const emailSubject = process.env.EMAIL_SUBJECT || `Admissions Application Paid: ${record.reference}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const messageLines = [
    'A new admissions form has been submitted and paid.',
    '',
    `Reference: ${record.reference}`,
    `Learner name: ${record.fields.learner_name || ''}`,
    `Parent email: ${record.fields.parent_email || ''}`,
  ];

  await transporter.sendMail({
    from: emailFrom,
    to: emailTo,
    subject: emailSubject,
    text: messageLines.join('\n'),
    html: `<h2>Admissions Application Paid</h2><p>${messageLines.join('<br>')}</p>`,
    attachments,
  });

  // send WhatsApp (preferred) or SMS via Twilio if configured
  try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const parentPhone = record.fields.parent_phone;

      // WhatsApp preferred: requires TWILIO_WHATSAPP_FROM e.g. 'whatsapp:+2771xxxxxxx'
      if (process.env.TWILIO_WHATSAPP_FROM && parentPhone) {
        const to = parentPhone.startsWith('whatsapp:') ? parentPhone : `whatsapp:${parentPhone}`;
        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          to,
          body: `Your application ${record.reference} for ${record.fields.learner_name || 'learner'} has been received and paid. Reference: ${record.reference}`,
        });
      }

      // Admin WhatsApp (optional)
      if (process.env.TWILIO_WHATSAPP_FROM && process.env.ADMIN_PHONE) {
        const adminTo = process.env.ADMIN_PHONE.startsWith('whatsapp:') ? process.env.ADMIN_PHONE : `whatsapp:${process.env.ADMIN_PHONE}`;
        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          to: adminTo,
          body: `Application ${record.reference} has been paid by ${record.fields.parent_name || 'parent'}.`,
        });
      }

      // Fallback to SMS if TWILIO_FROM is set and WhatsApp not configured
      if (!process.env.TWILIO_WHATSAPP_FROM && process.env.TWILIO_FROM) {
        if (parentPhone) {
          await client.messages.create({
            from: process.env.TWILIO_FROM,
            to: parentPhone,
            body: `Your application ${record.reference} for ${record.fields.learner_name || 'learner'} has been received and paid. Reference: ${record.reference}`,
          });
        }
        if (process.env.ADMIN_PHONE) {
          await client.messages.create({
            from: process.env.TWILIO_FROM,
            to: process.env.ADMIN_PHONE,
            body: `Application ${record.reference} has been paid by ${record.fields.parent_name || 'parent'}.`,
          });
        }
      }
    }
  } catch (smsErr) {
    console.error('Failed to send message via Twilio:', smsErr);
  }

  // save updated record
  await fs.writeFile(path.join(appPath, 'application.json'), JSON.stringify(record, null, 2));

  return record;
}

// Confirm payment endpoint (manual/simulated payments)
app.post('/api/confirm-payment', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const { appId, method, txn_ref } = req.body || {};
    if (!appId) return res.status(400).json({ error: 'Missing appId' });

    const appPath = path.join(applicationsDir, appId);
    const metaPath = path.join(appPath, 'application.json');
    if (!fssync.existsSync(metaPath)) return res.status(404).json({ error: 'Application not found' });

    const metaRaw = await fs.readFile(metaPath, 'utf8');
    const record = JSON.parse(metaRaw);
    record.payment = { method: method || 'unknown', txn_ref: txn_ref || null };

    const finalized = await finalizeApplication(appId, record, appPath);

    return res.json({ success: true, reference: finalized.reference, confirmationUrl: `/application-confirmation.html?appId=${encodeURIComponent(appId)}` });
  } catch (err) {
    console.error('Confirm payment failed:', err);
    return res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Confirm payment with uploaded proof (EFT upload)
app.post('/api/confirm-payment-upload', upload.single('proof'), async (req, res) => {
  try {
    const { appId, method } = req.body || {};
    if (!appId) return res.status(400).json({ error: 'Missing appId' });

    const appPath = path.join(applicationsDir, appId);
    const metaPath = path.join(appPath, 'application.json');
    if (!fssync.existsSync(metaPath)) return res.status(404).json({ error: 'Application not found' });

    const metaRaw = await fs.readFile(metaPath, 'utf8');
    const record = JSON.parse(metaRaw);

    if (req.file) {
      const dest = path.join(appPath, `${Date.now()}-${req.file.originalname}`);
      await fs.writeFile(dest, req.file.buffer);
      // add to files
      record.files = record.files || [];
      record.files.push(path.relative(__dirname, dest).replace(/\\/g, '/'));
    }

    record.payment = { method: method || 'eft_upload', txn_ref: null };

    const finalized = await finalizeApplication(appId, record, appPath);

    return res.json({ success: true, reference: finalized.reference, confirmationUrl: `/application-confirmation.html?appId=${encodeURIComponent(appId)}` });
  } catch (err) {
    console.error('Confirm payment upload failed:', err);
    return res.status(500).json({ error: 'Failed to confirm payment upload' });
  }
});

// PayFast init endpoint - redirects user to PayFast with required fields
app.get('/api/payfast-init', async (req, res) => {
  try {
    loadEnv();

    const appId = req.query.appId;

    if (!appId) {
      return res.status(400).send('Application ID missing');
    }

    const appPath = path.join(applicationsDir, appId);
    const metaPath = path.join(appPath, 'application.json');

    if (!fssync.existsSync(metaPath)) {
      return res.status(404).send('Application not found');
    }

    const application = JSON.parse(await fs.readFile(metaPath, 'utf8'));

    const merchant_id = process.env.PAYFAST_MERCHANT_ID;
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';

    const payment = {
      merchant_id,
      merchant_key,
      return_url: process.env.PAYFAST_RETURN_URL,
      cancel_url: process.env.PAYFAST_CANCEL_URL,
      notify_url: process.env.PAYFAST_NOTIFY_URL,

      name_first: application.fields.parent_name || 'Parent',
      email_address: application.fields.parent_email,

      m_payment_id: appId,

      amount: '140.00',

      item_name: 'School Application Fee'
    };

    Object.keys(payment).forEach((key) => {
      if (
        payment[key] === undefined ||
        payment[key] === null ||
        payment[key] === ''
      ) {
        delete payment[key];
      }
    });

    let signatureString = '';

    Object.keys(payment).forEach((key) => {
      signatureString += key + '=' + encodeURIComponent(payment[key]).replace(/%20/g, '+') + '&';
    });

    signatureString = signatureString.slice(0, -1);

    if (passphrase) {
      signatureString += '&passphrase=' + encodeURIComponent(passphrase).replace(/%20/g, '+');
    }

    const signature = crypto.createHash('md5').update(signatureString).digest('hex');

    payment.signature = signature;

    let html = `
    <!DOCTYPE html>
    <html>
    <body>

    <p>Redirecting to secure payment...</p>

    <form id="payfastForm"
          action="https://sandbox.payfast.co.za/eng/process"
          method="post">
    `;

    Object.keys(payment).forEach((key) => {
      html += `
      <input
          type="hidden"
          name="${key}"
          value="${payment[key]}"
      >
      `;
    });

    html += `
    </form>

    <script>
    document.getElementById("payfastForm").submit();
    </script>

    </body>
    </html>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// PayFast notify endpoint (server-to-server)
app.post('/api/payfast-notify', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const params = req.body || {};
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const receivedSignature = params.signature;

    // verify signature
    const filtered = Object.keys(params).filter(k => k !== 'signature').sort();
    const query = filtered.map(k => `${k}=${params[k]}`).join('&');
    const signatureBase = passphrase ? `${query}&passphrase=${passphrase}` : query;
    const expected = crypto.createHash('md5').update(signatureBase).digest('hex');

    if (receivedSignature && receivedSignature !== expected) {
      console.warn('PayFast signature mismatch');
      return res.status(400).send('Invalid signature');
    }

    const appId = params.m_payment_id;
    if (!appId) return res.status(400).send('Missing m_payment_id');
    const appPath = path.join(applicationsDir, appId);
    const metaPath = path.join(appPath, 'application.json');
    if (!fssync.existsSync(metaPath)) return res.status(404).send('Application not found');

    const metaRaw = await fs.readFile(metaPath, 'utf8');
    const record = JSON.parse(metaRaw);

    record.payment = { method: 'payfast', txn_ref: params.payfast_payment_id || params.pf_payment_id || null, raw: params };

    const finalized = await finalizeApplication(appId, record, appPath);

    // respond 200 to PayFast
    res.send('OK');
  } catch (err) {
    console.error('PayFast notify failed:', err);
    res.status(500).send('Error');
  }
});

// PayFast return endpoint (browser redirect after payment)
app.get('/api/payfast-return', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const appId = req.query.appId || req.query.m_payment_id;
    if (!appId) return res.status(400).send('Missing appId');
    const appPath = path.join(applicationsDir, appId);
    const metaPath = path.join(appPath, 'application.json');
    if (!fssync.existsSync(metaPath)) return res.status(404).send('Application not found');

    const metaRaw = await fs.readFile(metaPath, 'utf8');
    const record = JSON.parse(metaRaw);

    if (record.status !== 'paid') {
      // Payment may have completed but notify not yet fired; keep user waiting or ask them to return later.
      return res.redirect(`/application-confirmation.html?appId=${encodeURIComponent(appId)}`);
    }

    return res.redirect(`/application-confirmation.html?appId=${encodeURIComponent(appId)}`);
  } catch (err) {
    console.error('PayFast return failed:', err);
    return res.status(500).send('PayFast return error');
  }
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`Admissions backend running at http://${host}:${port}`);
});
